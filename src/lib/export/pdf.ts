import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { Deal } from '@/types/supabase'
import type { NapkinAnalysisResult } from '@/components/napkin/napkin-analysis-container'
import type { RiskAssessment } from '@/lib/ai/risk-assessment'
import type { InvestmentMemo } from '@/lib/ai/memo-generation'
import type { T12Month, T12Totals } from '@/lib/calculations/t12'
import type { ProformaYear, ProformaMetrics } from '@/lib/calculations/proforma'

// Relik brand colors
const COLORS = {
  evergreen: '#18312E',
  gold: '#B8986A',
  offWhite: '#F9FCFC',
  gray: '#697374',
  darkTeal: '#020E0E',
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: COLORS.offWhite,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.evergreen,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.evergreen,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.evergreen,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: COLORS.gray,
    width: '40%',
  },
  value: {
    fontSize: 10,
    color: COLORS.darkTeal,
    width: '60%',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 10,
    color: COLORS.darkTeal,
    lineHeight: 1.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray + '40',
  },
  metricLabel: {
    fontSize: 9,
    color: COLORS.gray,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.evergreen,
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '30',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: COLORS.evergreen,
    color: COLORS.offWhite,
  },
  tableCell: {
    fontSize: 9,
    padding: 4,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.offWhite,
    padding: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeGreen: {
    backgroundColor: '#10b981',
    color: '#FFFFFF',
  },
  badgeRed: {
    backgroundColor: '#ef4444',
    color: '#FFFFFF',
  },
  badgeYellow: {
    backgroundColor: '#f59e0b',
    color: '#FFFFFF',
  },
  badgeBlue: {
    backgroundColor: '#3b82f6',
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: COLORS.gray,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '40',
    paddingTop: 10,
  },
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const formatPercent = (value: number, decimals: number = 2) =>
  `${(value * 100).toFixed(decimals)}%`

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Napkin Summary PDF Document
export const NapkinPDFDocument = ({
  deal,
  analysis,
}: {
  deal: Deal
  analysis: NapkinAnalysisResult
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{deal.name}</Text>
        <Text style={styles.subtitle}>
          Seven-Minute Napkin Analysis · Generated {formatDate(new Date())}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>
            {deal.city}, {deal.state}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Property Type:</Text>
          <Text style={styles.value}>{deal.property_type?.replace(/_/g, ' ')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Units:</Text>
          <Text style={styles.value}>{deal.total_units}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Licensed Beds:</Text>
          <Text style={styles.value}>{deal.licensed_beds}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Asking Price:</Text>
          <Text style={styles.value}>{formatCurrency(Number(deal.asking_price))}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Net Operating Income</Text>
            <Text style={styles.metricValue}>{formatCurrency(analysis.noi)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Cap Rate</Text>
            <Text style={styles.metricValue}>{formatPercent(analysis.capRate)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Expense Ratio</Text>
            <Text style={styles.metricValue}>{formatPercent(analysis.expenseRatio)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Cash-on-Cash Return</Text>
            <Text style={styles.metricValue}>{formatPercent(analysis.cashOnCashReturn)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Equity Multiple</Text>
            <Text style={styles.metricValue}>{analysis.equityMultiple.toFixed(2)}x</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Maximum Offer Price</Text>
            <Text style={styles.metricValue}>{formatCurrency(analysis.maxOfferPrice)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Analysis</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Recommendation:</Text>
          <Text style={[styles.value, { textTransform: 'uppercase' }]}>
            {analysis.recommendation.replace(/_/g, ' ')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Confidence:</Text>
          <Text style={styles.value}>{analysis.confidence}/10</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.text}>{analysis.summary}</Text>
        </View>
      </View>

      {analysis.redFlags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Red Flags</Text>
          {analysis.redFlags.map((flag, index) => (
            <View key={index} style={{ marginBottom: 5 }}>
              <Text style={[styles.text, { color: '#ef4444' }]}>• {flag}</Text>
            </View>
          ))}
        </View>
      )}

      {analysis.keyAssumptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Assumptions</Text>
          {analysis.keyAssumptions.map((assumption, index) => (
            <View key={index} style={{ marginBottom: 5 }}>
              <Text style={styles.text}>• {assumption}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text>
          Relik Capital Group · Confidential Investment Analysis · Page 1 of 1
        </Text>
      </View>
    </Page>
  </Document>
)

// Full Underwriting PDF Document
export const FullUnderwritingPDFDocument = ({
  deal,
  napkin,
  t12Data,
  t12Totals,
  proformaYears,
  proformaMetrics,
  riskAssessment,
}: {
  deal: Deal
  napkin?: NapkinAnalysisResult
  t12Data: T12Month[]
  t12Totals: T12Totals
  proformaYears: ProformaYear[]
  proformaMetrics: ProformaMetrics
  riskAssessment?: RiskAssessment
}) => (
  <Document>
    {/* Cover Page */}
    <Page size="A4" style={styles.page}>
      <View style={{ marginTop: 150, alignItems: 'center' }}>
        <Text style={[styles.title, { fontSize: 32, marginBottom: 20 }]}>
          Investment Analysis
        </Text>
        <Text style={[styles.subtitle, { fontSize: 18, marginBottom: 10 }]}>
          {deal.name}
        </Text>
        <Text style={[styles.subtitle, { fontSize: 14 }]}>
          {deal.city}, {deal.state}
        </Text>
        <Text style={[styles.subtitle, { fontSize: 12, marginTop: 40 }]}>
          Prepared: {formatDate(new Date())}
        </Text>
        <Text style={[styles.subtitle, { fontSize: 12, marginTop: 5 }]}>
          Relik Capital Group
        </Text>
      </View>
    </Page>

    {/* Deal Summary Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Deal Summary</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Property Name:</Text>
          <Text style={styles.value}>{deal.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>
            {deal.city}, {deal.state}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Property Type:</Text>
          <Text style={styles.value}>{deal.property_type?.replace(/_/g, ' ')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Units:</Text>
          <Text style={styles.value}>{deal.total_units}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Licensed Beds:</Text>
          <Text style={styles.value}>{deal.licensed_beds}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Asking Price:</Text>
          <Text style={styles.value}>{formatCurrency(Number(deal.asking_price))}</Text>
        </View>
        {deal.max_offer_price && (
          <View style={styles.row}>
            <Text style={styles.label}>Maximum Offer:</Text>
            <Text style={styles.value}>{formatCurrency(Number(deal.max_offer_price))}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Annual NOI:</Text>
          <Text style={styles.value}>{formatCurrency(t12Totals.totalNOI)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Purchase Cap Rate:</Text>
          <Text style={styles.value}>
            {deal.cap_rate_purchase
              ? formatPercent(Number(deal.cap_rate_purchase))
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investment Returns</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Equity Multiple</Text>
            <Text style={styles.metricValue}>
              {proformaMetrics.equityMultiple.toFixed(2)}x
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>IRR</Text>
            <Text style={styles.metricValue}>
              {formatPercent(proformaMetrics.irr)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Avg Cash-on-Cash</Text>
            <Text style={styles.metricValue}>
              {formatPercent(proformaMetrics.averageCashOnCash)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Equity Invested</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(proformaMetrics.totalEquityInvested)}
            </Text>
          </View>
        </View>
      </View>

      {riskAssessment && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Overall Risk Score:</Text>
            <Text style={styles.value}>{riskAssessment.overallScore}/10</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={styles.text}>{riskAssessment.summary}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text>Relik Capital Group · Confidential · Page 2</Text>
      </View>
    </Page>

    {/* T12 Financials Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Trailing 12-Month Financials</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Annual Summary</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Gross Revenue</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(t12Totals.totalGrossRevenue)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Expenses</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(t12Totals.totalExpenses)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Net Operating Income</Text>
            <Text style={styles.metricValue}>{formatCurrency(t12Totals.totalNOI)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Avg Occupancy</Text>
            <Text style={styles.metricValue}>
              {formatPercent(t12Totals.avgOccupancyRate)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Relik Capital Group · Confidential · Page 3</Text>
      </View>
    </Page>

    {/* Proforma Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Proforma Projections</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCellHeader, { width: '10%' }]}>Year</Text>
          <Text style={[styles.tableCellHeader, { width: '15%' }]}>Revenue</Text>
          <Text style={[styles.tableCellHeader, { width: '15%' }]}>Expenses</Text>
          <Text style={[styles.tableCellHeader, { width: '15%' }]}>NOI</Text>
          <Text style={[styles.tableCellHeader, { width: '15%' }]}>Debt Svc</Text>
          <Text style={[styles.tableCellHeader, { width: '15%' }]}>Cash Flow</Text>
          <Text style={[styles.tableCellHeader, { width: '15%' }]}>Events</Text>
        </View>
        {proformaYears.map((year) => (
          <View key={year.year} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '10%' }]}>{year.year}</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {formatCurrency(year.grossRevenue)}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {formatCurrency(year.totalExpenses)}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {formatCurrency(year.noi)}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {formatCurrency(year.debtService)}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {formatCurrency(year.cashFlow)}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {year.isRefiYear ? 'Refi' : year.isExitYear ? 'Exit' : '-'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text>Relik Capital Group · Confidential · Page 4</Text>
      </View>
    </Page>
  </Document>
)

// Investment Memo PDF Document
export const InvestmentMemoPDFDocument = ({
  deal,
  memo,
}: {
  deal: Deal
  memo: InvestmentMemo
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Investment Memorandum</Text>
        <Text style={styles.subtitle}>
          {deal.name} · {formatDate(new Date())}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.text}>{memo.executiveSummary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Overview</Text>
        <Text style={styles.text}>{memo.propertyOverview}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <Text style={styles.text}>{memo.financialSummary}</Text>
      </View>

      <View style={styles.footer}>
        <Text>Relik Capital Group · Confidential · Page 1 of 2</Text>
      </View>
    </Page>

    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proforma and Returns</Text>
        <Text style={styles.text}>{memo.proformaAndReturns}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fee Structure</Text>
        <Text style={styles.text}>{memo.feeStructure}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Factors</Text>
        <Text style={styles.text}>{memo.riskFactors}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendation</Text>
        <Text style={styles.text}>{memo.recommendation}</Text>
      </View>

      <View style={styles.footer}>
        <Text>Relik Capital Group · Confidential · Page 2 of 2</Text>
      </View>
    </Page>
  </Document>
)
