import moment from 'moment-timezone';

const timezone = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

export const format = {
  date: (value) => moment(value).tz(timezone).format('DD/MM/YYYY'),
  currency: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
};
