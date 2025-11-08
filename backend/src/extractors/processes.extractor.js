export default class ProcessesExtractor {
  constructor(api, ProcessoModel) {
    this.api = api;
    this.Processo = ProcessoModel;
  }

  async syncRange() {
    // TODO: implementar sincronização de processos
    return { processed: 0 };
  }
}
