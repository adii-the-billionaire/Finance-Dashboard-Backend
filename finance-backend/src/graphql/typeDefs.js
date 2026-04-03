import gql from 'graphql-tag';

export const typeDefs = gql`
  enum Role {
    VIEWER
    ANALYST
    ADMIN
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
  }

  enum FinancialType {
    income
    expense
  }

  enum TrendGranularity {
    weekly
    monthly
  }

  type User {
    id: ID!
    email: String!
    displayName: String!
    role: Role!
    status: UserStatus!
    createdAt: String!
    updatedAt: String!
  }

  type UserEdge {
    user: User!
  }

  type RecordCreator {
    id: ID
    email: String
    displayName: String
  }

  type FinancialRecord {
    id: ID!
    amount: Float!
    type: FinancialType!
    category: String!
    date: String!
    notes: String!
    createdBy: RecordCreator
    createdAt: String!
    updatedAt: String!
  }

  type FinancialRecordPage {
    items: [FinancialRecord!]!
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type DashboardTotals {
    totalIncome: Float!
    totalExpenses: Float!
    netBalance: Float!
    recordCount: Int!
  }

  type CategoryTotal {
    category: String!
    type: FinancialType!
    total: Float!
  }

  type RecentActivityItem {
    id: ID!
    amount: Float!
    type: FinancialType!
    category: String!
    date: String!
    notes: String!
    createdAt: String!
  }

  type TrendRow {
    period: String!
    income: Float!
    expense: Float!
    net: Float!
  }

  type DashboardSummary {
    totals: DashboardTotals!
    categoryBreakdown: [CategoryTotal!]!
    recentActivity: [RecentActivityItem!]!
    trends: [TrendRow!]!
    trendGranularity: TrendGranularity!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DeleteResult {
    id: ID!
    deleted: Boolean!
  }

  input LoginInput {
    email: String!
  }

  input CreateUserInput {
    email: String!
    displayName: String
    role: Role
    status: UserStatus
  }

  input UpdateUserInput {
    displayName: String
    role: Role
    status: UserStatus
  }

  input FinancialRecordInput {
    amount: Float!
    type: FinancialType!
    category: String!
    date: String!
    notes: String
  }

  input FinancialRecordUpdateInput {
    amount: Float
    type: FinancialType
    category: String
    date: String
    notes: String
  }

  input RecordFilterInput {
    type: FinancialType
    category: String
    dateFrom: String
    dateTo: String
    page: Int
    limit: Int
  }

  input DashboardInput {
    recentLimit: Int
    trendGranularity: TrendGranularity
  }

  type Query {
    me: User
    users: [User!]!
    user(id: ID!): User
    financialRecords(filter: RecordFilterInput): FinancialRecordPage!
    financialRecord(id: ID!): FinancialRecord!
    dashboardSummary(input: DashboardInput): DashboardSummary!
  }

  type Mutation {
    login(input: LoginInput!): AuthPayload!
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    createFinancialRecord(input: FinancialRecordInput!): FinancialRecord!
    updateFinancialRecord(id: ID!, input: FinancialRecordUpdateInput!): FinancialRecord!
    deleteFinancialRecord(id: ID!): DeleteResult!
  }
`;
