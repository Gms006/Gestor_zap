export default class InvoicesExtractor {
  constructor(api, BoletoModel) {
    this.api = api;
    this.Boleto = BoletoModel;
  }

  async syncRange() {
    // TODO: implementar sincronização de boletos
    return { processed: 0 };
  }
}
