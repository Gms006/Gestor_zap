export default class CompaniesExtractor {
  constructor(api, EmpresaModel) {
    this.api = api;
    this.Empresa = EmpresaModel;
  }

  async syncAll() {
    // TODO: implementar sincronização completa
    return { processed: 0, updated: 0 };
  }
}
