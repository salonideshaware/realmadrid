/* eslint-disable no-underscore-dangle */
import { readBlockConfig, fetchPlaceholders } from '../../scripts/lib-franklin.js';

// todo : make it configurable
const API = {
  football: '/realmadridmastersite/matchesVIPFootball',
  basketball: '/realmadridmastersite/matchesVIPBasket',
};

const timeformat = new Intl.DateTimeFormat('es-ES', { minute: '2-digit', hour12: false, hour: '2-digit' });
const dateformat = new Intl.DateTimeFormat('es-ES', { weekday: 'short', month: 'short', day: '2-digit' });
const renderMatch = (placeholders) => (match) => {
  const div = document.createElement('div');
  const ctaLabel = placeholders['COMPRAR ENTRADAS VIP'];
  const time = new Date(match.dateTime);
  div.classList.add('match');
  div.innerHTML = `<img class="logo competition" src="${match.competition.logo._publishUrl}" alt="match logo">
    <div class="competition-info">
      <span>competition name</span>
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
    <div class="price">desde 1.400€</div>
    <a class="button cta" href="#">COMPRAR ENTRADAS VIP</a>
  </div>
  `;
  return div;
};

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const placeholders = await fetchPlaceholders();
  const gqlEndpoint = placeholders.matchesGqApi;
  const { sport } = config;
  const url = new URL(`${gqlEndpoint}${API[sport.toLowerCase()]}`); // todo: add params fromDate endDate
  const response = await fetch(url);
  const data = await response.json();
  const items = data.data.matchList.items.map(renderMatch(placeholders));
  block.innerHTML = '';
  block.append(...items);
}
