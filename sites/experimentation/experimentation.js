// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
  toCamelCase,
  toClassName,
} from '../scripts/lib-franklin.js';

/**
 * Calculates percentage split for variants where the percentage split is not
 * explicitly configured.
 * Substracts from 100 the explicitly configured percentage splits,
 * and divides the remaining percentage, among the variants without explicit
 * percentage split configurated.
 * @param {Array} variant objects
 */
function inferPercentageSplit(variants) {
  let variantsWithoutPercentage = 0;
  const remainingPercentage = variants.reduce((result, variant) => {
    if (!variant.percentageSplit) {
      variantsWithoutPercentage += 1;
    }
    const newResult = result - parseFloat(variant.percentageSplit || 0);
    return newResult;
  }, 1);
  return variantsWithoutPercentage > 0
    ? remainingPercentage / variantsWithoutPercentage : remainingPercentage;
}
/**
 * Parses the experimentation configuration sheet and creates an internal model.
 *
 * Output model is expected to have the following structure:
 *      {
 *        label: <string>,
 *        blocks: [<string>]
 *        audience: Desktop | Mobile,
 *        status: Active | On | True | Yes,
 *        variantNames: [<string>],
 *        variants: {
 *          [variantName]: {
 *            label: <string>
 *            percentageSplit: <number 0-1>,
 *            pages: <string>,
 *            blocks: <string>,
 *          }
 *        }
 *      };
 */
function parseExperimentConfig(json) {
  const config = {};
  try {
    json.settings.data.forEach((line) => {
      const key = toCamelCase(line.Name);
      config[key] = line.Value;
    });
    const variants = {};
    let variantNames = Object.keys(json.experiences.data[0]);
    variantNames.shift();
    variantNames = variantNames.map((vn) => toCamelCase(vn));
    variantNames.forEach((variantName) => {
      variants[variantName] = {};
    });
    let lastKey = 'default';
    json.experiences.data.forEach((line) => {
      let key = toCamelCase(line.Name);
      if (!key) key = lastKey;
      lastKey = key;
      const vns = Object.keys(line);
      vns.shift();
      vns.forEach((vn) => {
        if (!line[vn]) {
          return;
        }
        const camelVN = toCamelCase(vn);
        if (key === 'pages' || key === 'blocks') {
          variants[camelVN][key] = variants[camelVN][key] || [];
          if (key === 'pages') {
            variants[camelVN][key] = line[vn].split(',').map((p) => new URL(p.trim()).pathname);
          }
          else variants[camelVN][key].push(line[vn]);
        } else {
          variants[camelVN][key] = line[vn];
        }
      });
    });
    config.variants = variants;
    config.variantNames = variantNames;

    variantNames.forEach( (vn) => {
      // fill empty percentage split
      const { percentageSplit } = config.variants[vn];
      config.variants[vn].percentageSplit = percentageSplit ?
        parseFloat(percentageSplit) : inferPercentageSplit(Object.values(config.variants));
    });
    return config;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error parsing experiment config:', e);
  }
  return null;
}

/**
 * Gets experiment config from the manifest and transforms it to more easily
 * consumable structure.
 *
 * the manifest consists of two sheets "settings" and "experiences", by default
 *
 * "settings" is applicable to the entire test and contains information
 * like "Audience", "Status" or "Blocks".
 *
 * "experience" hosts the experiences in rows, consisting of:
 * a "Percentage Split", "Label" and a set of "Links".
 *
 *
 * @param {string} experimentId
 * @param {object} cfg
 * @returns {object} containing the experiment manifest
 */
export async function getExperimentConfig(experimentId, instantExperiment) {
  if (instantExperiment) {
    const config = {
      label: `Instant Experiment: ${experimentId}`,
      audience: '',
      status: 'Active',
      id: toClassName(experimentId),
      variants: {},
      variantNames: [],
    };

    const pages = instantExperiment.split(',').map((p) => new URL(p.trim()).pathname);
    const evenSplit = 1 / (pages.length + 1);

    config.variantNames.push('control');
    config.variants.control = {
      percentageSplit: '',
      pages: [window.location.pathname],
      blocks: [],
      label: 'Control',
    };

    pages.forEach((page, i) => {
      const vname = `challenger-${i + 1}`;
      config.variantNames.push(vname);
      config.variants[vname] = {
        percentageSplit: `${evenSplit}`,
        pages: [page],
        label: `Challenger ${i + 1}`,
      };
    });

    return (config);
  }

  const path = `/experimentation/${experimentId}/manifest.json`;
  try {
    const resp = await fetch(path);
    if (!resp.ok) {
      // eslint-disable-next-line no-console
      console.log('error loading experiment config:', resp);
      return null;
    }
    const json = await resp.json();
    const config = parseExperimentConfig(json);
    config.id = experimentId;
    config.manifest = path;
    config.basePath = `/experimentation/${experimentId}`;
    config.label = `Full Experiment: ${experimentId}`;
    return config;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`error loading experiment manifest: ${path}`, e);
  }
  return null;
}

async function getResolvedSegment(audiences, applicableSegments) {
  const results = await Promise.all(applicableSegments.map((segment) => {
    if (audiences[segment.id] && typeof audiences[segment.id].test === 'function') {
      return audiences[segment.id].test();
    }
    return true;
  }));
  return applicableSegments.filter((_, i) => results[i]);
}

/*
 * this is an extensible stub to take on audience mappings
 * @param {string} audience
 * @return {boolean} is member of this audience
*/
export function isValidAudience(audience, availableAudiences = {}) {
  const configuredAudience = availableAudiences[audience];
  return configuredAudience && configuredAudience.test();
}

/**
 * Checks whether the current page is suitable to run an experiment.
 * It is a production or live domain, url does not contain a fragment
 * preceded with a hash, and it is not a bot.
 * @returns {boolean} true if the current is suitable to run an experiment
 */
function isSuitablePage() {
  if (!window.location.host.includes('realmadrid.com') && !window.location.host.includes('.hlx.live')) {
    return false;
    // reason = 'not prod host';
  }
  if (window.location.hash) {
    return false;
    // reason = 'suppressed by #';
  }

  if (navigator.userAgent.match(/bot|crawl|spider/i)) {
    return false;
    // reason = 'bot detected';
  }
  return true;
}

function getDecisionPolicy(config) {
  const decisionPolicy = {
    id: 'content-experimentation-policy',
    rootDecisionNodeId: 'n1',
    decisionNodes: [{
      id: 'n1',
      type: 'EXPERIMENTATION',
      experiment: {
        id: config.id,
        identityNamespace: 'ECID',
        randomizationUnit: 'DEVICE',
        treatments: Object.entries(config.variants).map(([key, props]) => ({
          id: key,
          allocationPercentage: props.percentageSplit ? parseFloat(props.percentageSplit) * 100 : 0,
        })),
      },
    }],
  };
  return decisionPolicy;
}

/**
 * Replaces element with content from path
 * @param {string} path
 * @param {HTMLElement} element
 * @param {boolean} isBlock
 */
async function replaceInner(path, element, isBlock = false) {
  const plainPath = `${path}.plain.html`;
  try {
    const resp = await fetch(plainPath);
    if (!resp.ok) {
      // eslint-disable-next-line no-console
      console.log('error loading experiment content:', resp);
      return null;
    }
    const html = await resp.text();
    if (isBlock) {
      const div = document.createElement('div');
      div.innerHTML = html;
      element.replaceWith(div.children[0].children[0]);
    } else {
      element.innerHTML = html;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`error loading experiment content: ${plainPath}`, e);
  }
  return null;
}

export async function runExperiment(experiment, instantExperiment, config = {}) {
  const usp = new URLSearchParams(window.location.search);
  const [forcedExperiment, forcedVariant] = usp.has('experiment') ? usp.get('experiment').split('/') : [];

  const experimentConfig = await getExperimentConfig(experiment, instantExperiment);
  if (!experimentConfig || (toCamelCase(experimentConfig.status) !== 'active' && !forcedExperiment)) {
    return;
  }

  experimentConfig.run = forcedExperiment
    || (isValidAudience(toClassName(experimentConfig.audience), config.audiences) && isSuitablePage());

  window.hlx = window.hlx || {};
  window.hlx.experiment = experimentConfig;
  if (!experimentConfig.run) {
    // eslint-disable-next-line no-console
    console.debug('run', experimentConfig.run, experimentConfig.audience, isSuitablePage());
    return;
  }

  if (forcedVariant && experimentConfig.variantNames.includes(forcedVariant)) {
    experimentConfig.selectedVariant = forcedVariant;
  } else {
    const { evaluateDecisionPolicy } = await import('./experimentation-ued.js');
    const decision = evaluateDecisionPolicy(getDecisionPolicy(experimentConfig), {});
    experimentConfig.selectedVariant = decision.items[0].id;
  }

  sampleRUM('experiment', { source: experimentConfig.id, target: experimentConfig.selectedVariant });
  // eslint-disable-next-line no-console
  console.debug(`running experiment (${window.hlx.experiment.id}) -> ${window.hlx.experiment.selectedVariant}`);

  if (experimentConfig.selectedVariant === experimentConfig.variantNames[0]) {
    return;
  }

  const currentPath = window.location.pathname;
  const { pages } = experimentConfig.variants[experimentConfig.selectedVariant];
  if (!pages.length) {
    return;
  }

  const control = experimentConfig.variants[experimentConfig.variantNames[0]];
  const index = control.pages.indexOf(currentPath);
  if (index < 0 || pages[index] === currentPath) {
    return;
  }

  // Fullpage content experiment
  document.body.classList.add(`experiment-${experimentConfig.id}`);
  document.body.classList.add(`variant-${experimentConfig.selectedVariant}`);
  await replaceInner(pages[index], document.querySelector('main'));
}

export async function runSegmentation(segments, config = {}) {
  const usp = new URLSearchParams(window.location.search);
  const forcedSegment = usp.get('segment');

  const resolved = forcedSegment
    ? segments.filter((s) => s.id === forcedSegment)
    : await getResolvedSegment(config.audiences, segments);

  const [segment] = resolved;
  window.hlx = window.hlx || {};
  window.hlx.segmentation = {
    segments: [
      { id: 'default', label: 'Default', url: window.location.href },
      ...segments.map((s) => ({
        ...s,
        ...config.audiences[s.id],
      }))
    ],
    resolvedSegment: segment,
  };

  if (!resolved.length) {
    return;
  }

  sampleRUM('segmentation', { source: segment.id, target: segment.url });
  // eslint-disable-next-line no-console
  console.debug(`running segmentation (${segment.id}) -> ${segment.url}`);

  const currentPath = window.location.pathname;
  const segmentPath = new URL(segment.url).pathname;
  if (currentPath === segmentPath) {
    return;
  }

  // Fullpage segmentation
  if (config.resolution === 'redirect') {
    window.location.replace(segmentPath);
  } else {
    document.body.classList.add(`segment-${segment.id}`);
    await replaceInner(segmentPath, document.querySelector('main'));
  }
}

/**
 * Patches the block config for the experimentation use case.
 * @param {object} config the block config
 * @returns the patched block config for experimentation
 */
export function patchBlockConfig(config) {
  const { experiment } = window.hlx;

  // No experiment is running
  if (!experiment || !experiment.run) {
    return config;
  }

  // The current experiment does not modify the block
  if (experiment.selectedVariant === experiment.variantNames[0]
    || !experiment.blocks || !experiment.blocks.includes(config.blockName)) {
    return config;
  }

  // The current experiment does not modify the block code
  const variant = experiment.variants[experiment.selectedVariant];
  if (!variant.blocks.length) {
    return config;
  }

  let index = experiment.variants[experiment.variantNames[0]].blocks.indexOf('');
  if (index < 0) {
    index = experiment.variants[experiment.variantNames[0]].blocks.indexOf(config.blockName);
  }
  if (index < 0) {
    index = experiment.variants[experiment.variantNames[0]].blocks.indexOf(`/blocks/${config.blockName}`);
  }
  if (index < 0) {
    return config;
  }

  let origin = '';
  let path;
  if (/^https?:\/\//.test(variant.blocks[index])) {
    const url = new URL(variant.blocks[index]);
    // Experimenting from a different branch
    if (url.origin !== window.location.origin) {
      origin = url.origin;
    }
    // Experimenting from a block path
    if (url.pathname !== '/') {
      path = url.pathname;
    } else {
      path = `/blocks/${config.blockName}`;
    }
  } else { // Experimenting from a different branch on the same branch
    path = variant.blocks[index];
  }
  if (!origin && !path) {
    return config;
  }

  const { codeBasePath } = window.hlx;
  return {
    ...config,
    cssPath: `${origin}${codeBasePath}${path}/${config.blockName}.css`,
    jsPath: `${origin}${codeBasePath}${path}/${config.blockName}.js`,
  };
}
window.hlx.patchBlockConfig.push(patchBlockConfig);
