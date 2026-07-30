export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
}

export enum BazaarNiche {
  MODA_FEMININA = 'Moda Feminina',
  MODA_MASCULINA = 'Moda Masculina',
  BRECHO_VINTAGE = 'Brechó & Vintage',
  INFANTIL = 'Infantil & Bebê',
  CALCADOS_ACESSORIOS = 'Calçados & Acessórios',
  VARIEDADES = 'Variedades & Outros',
}

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
