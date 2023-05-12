/* eslint-disable no-underscore-dangle */
import { readBlockConfig, fetchPlaceholders } from '../../scripts/lib-franklin.js';

// todo : make it configurable
const API = {
  football: '/realmadridmastersite/matchesVIPFootball',
  basketball: '/realmadridmastersite/matchesVIPBasket',
};

function getLocale() { // todo: read from the URL ?
  return 'es-ES';
}

const timeformat = new Intl.DateTimeFormat(getLocale(), { minute: '2-digit', hour12: false, hour: '2-digit' });
const dateformat = new Intl.DateTimeFormat(getLocale(), { weekday: 'short', month: 'short', day: '2-digit' });
const monthFormat = new Intl.DateTimeFormat(getLocale(), { month: 'short' });
const currentMonth = new Date().getMonth();
const monthNames = new Array(12).fill(1).map((x, i) => monthFormat.format(new Date(`2023-${i + 1}-1`)));

const renderMatch = (placeholders) => (match) => {
  const div = document.createElement('div');
  const ctaLabel = placeholders.buyVipTickets;
  const fromText = placeholders.from;
  const time = new Date(match.dateTime);
  const { matchday } = placeholders;
  div.classList.add('match');
  const month = monthFormat.format(time);
  div.setAttribute('data-month', month);
  div.innerHTML = `<img class="logo competition" src="${match.competition.logo._publishUrl}" alt="match logo">
    <div class="competition-info">
      <span>${matchday} ${match.week || 0}</span>
      <span>${match.venue.name}</span>
    </div>
    <div class="datetime">
      <span class="time">${timeformat.format(time)}</span>
      <span class="date">${dateformat.format(time)}</span>
    </div>
    <img class="logo team home" src="${match.homeTeam.logo._publishUrl}" alt="${match.homeTeam.name}">
    <img class="logo team home" src="${match.awayTeam.logo._publishUrl}" alt="${match.awayTeam.name}">
    <div class="teams">
      <span>${match.homeTeam.name}</span>
      <span>${match.awayTeam.name}</span>
    </div>
    <div class="price">${fromText} 1.400€</div>
    <a class="button cta" href="#">${ctaLabel}</a>
  </div>
  `;
  return div;
};

function getCurrentSeason() {
  return '22/23';
}

function getMonthOptions(months) {
  const content = months
    .map((m) => `<li class="option">
                  <a href="#month-${m}"
                     tabIndex="0"
                    data-filter="${m}">${m.toUpperCase()}</a>
                </li>`)
    .join('');
  return `<ol class="filters level-2">${content}</ol>`;
}

function filterMonth(block, month) {
  const allMatches = block.querySelectorAll(':scope > .match');
  let matchesToDisplay;
  if (month === 'all') {
    matchesToDisplay = allMatches;
  } else {
    allMatches.forEach((x) => x.classList.remove('appear'));
    matchesToDisplay = block.querySelectorAll(`:scope > .match[data-month="${month}"]`);
  }
  const emptyMatch = block.querySelector(':scope > .empty-match');
  emptyMatch.classList.toggle('appear', matchesToDisplay.length === 0);
  matchesToDisplay.forEach((x) => x.classList.add('appear'));
}

function createFilters(block, placeholders, months) {
  const { matchesOnSale, calendar } = placeholders;
  const ol = document.createElement('ol');
  ol.classList.add('filters', 'level-1');
  ol.innerHTML = `
    <li class="option active"><a href="#allMatches" tabIndex="0" data-filter="all">${matchesOnSale}</a></li>
    <li class="option nested"><a href="#calendar"tabIndex="0">${calendar} ${getCurrentSeason()}</a>
      ${getMonthOptions(months)}
    </li>
  `;
  ol.addEventListener('click', (e) => {
    const { target } = e;
    if (target.nodeName === 'A') {
      const li = target.parentElement;
      if (!li.classList.contains('active')) {
        const currentOl = li.parentElement;
        const currentActiveEl = currentOl.querySelector(':scope > li.active');
        if (currentActiveEl) {
          currentActiveEl.classList.remove('active');
        }
        li.classList.add('active');
        if (li.classList.contains('nested')) {
          const selectedOpt = li.querySelector(':scope li.active a') || li.querySelector(':scope li:first-child a');
          selectedOpt.click();
        }
        if (target.dataset.filter) {
          filterMonth(block, target.dataset.filter);
        }
      }
      e.preventDefault();
    }
  });
  return ol;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const placeholders = await fetchPlaceholders();
  const { matchesGqApi, noMatches } = placeholders;
  const { sport } = config;
  const url = new URL(`${matchesGqApi}${API[sport.toLowerCase()]}`); // todo: add params fromDate endDate
  const response = await fetch(url);
  const data = await response.json();
  const items = data.data.matchList.items.map(renderMatch(placeholders));
  // const months = new Set(items.map((x) => x.dataset.month));
  const months = [
    monthNames[currentMonth - 1],
    monthNames[currentMonth],
    monthNames[currentMonth + 1]]; // ideally this would be created from the api response done on line #118
  block.innerHTML = '';
  const emptyMatch = document.createElement('div');
  emptyMatch.classList.add('empty-match');
  emptyMatch.innerHTML = noMatches;
  block.append(createFilters(block, placeholders, months), ...items, emptyMatch);
  filterMonth(block, 'all');
}
