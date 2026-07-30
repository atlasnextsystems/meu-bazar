export enum ProductCategory {
  FEMININO = 'Feminino',
  MASCULINO = 'Masculino',
  INFANTIL = 'Infantil',
  CALCADOS = 'Calçados',
  ACESSORIOS = 'Acessórios',
  CASA_DECORACAO = 'Casa & Decoração',
  OUTROS = 'Outros',
}

export enum ProductCondition {
  NOVO_COM_ETIQUETA = 'Novo com Etiqueta',
  SEMINOVO_PERFEITO = 'Seminovo Perfeito',
  MARCAS_DE_USO = 'Marcas de Uso',
  VINTAGE = 'Vintage / Raro',
}

export enum ProductStatus {
  DISPONIVEL = 'Disponível',
  VENDIDO = 'Vendido',
  RESERVADO = 'Reservado',
}

export enum PaymentMethod {
  DINHEIRO = 'Dinheiro',
  PIX = 'PIX',
  CARTAO_CREDITO = 'Cartão de Crédito',
  CARTAO_DEBITO = 'Cartão de Débito',
  PAGSEGURO_ONLINE = 'PagSeguro Online',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum EnvMode {
  DEV = 'dev',
  PROD = 'prod',
}

export enum AuditAction {
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  UPDATE_PRODUCT = 'UPDATE_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  RESTORE_PRODUCT = 'RESTORE_PRODUCT',
  MARK_SOLD = 'MARK_SOLD',
  REGISTER_SALE = 'REGISTER_SALE',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
}
