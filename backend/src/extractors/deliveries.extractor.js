export default class DeliveriesExtractor {
  constructor(api, EntregaModel) {
    this.api = api;
    this.Entrega = EntregaModel;
  }

  async syncRange() {
    // TODO: implementar sincronização de entregas
    return { processed: 0 };
  }
}
