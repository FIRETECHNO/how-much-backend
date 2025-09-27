export interface CompanyFromDadata {
  data: {
    name: {
      full_with_opf: string
      short_with_opf: string
      full: string
    }
    inn: string
    ogrn: string
    okved: string
    kpp: string | null
    address: {
      value: string
    }
  }
  value: string
}