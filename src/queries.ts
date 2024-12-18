export const BALANCE_QUERY = `
  query Balances($filter: BalanceFilterInput!) {
    balances(filter: $filter, first: 100) {
      nodes {
        amount
        assetId
      }
    }
  }
`; 