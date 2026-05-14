'use client'
import { useState } from 'react'
import type { CaseData, IssueCategory } from '@/lib/case/caseTypes'

const ISSUE_CATEGORIES: IssueCategory[] = [
  'Cleaning', 'Damage', 'Fair wear and tear', 'Admin/default fee',
  'Missing item', 'Gardening', 'Rent arrears', 'Other',
]

interface Props {
  initial?: Partial<CaseData>
  onChange: (data: CaseData) => void
}

export default function CaseIntakeForm({ initial, onChange }: Props) {
  const [form, setForm] = useState<CaseData>({
    tenantName: initial?.tenantName ?? '',
    landlordName: initial?.landlordName ?? '',
    depositAmount: initial?.depositAmount ?? 0,
    totalDeductionAmount: initial?.totalDeductionAmount ?? 0,
    tenancyStartDate: initial?.tenancyStartDate ?? '',
    tenancyEndDate: initial?.tenancyEndDate ?? '',
    depositScheme: initial?.depositScheme ?? '',
    issueCategory: initial?.issueCategory ?? 'Cleaning',
    userQuestion: initial?.userQuestion ?? '',
  })

  function update<K extends keyof CaseData>(key: K, val: CaseData[K]) {
    const next = { ...form, [key]: val }
    setForm(next)
    onChange(next)
  }

  const label = 'block text-sm font-medium text-gray-700 mb-1'
  const input = 'w-full border border-gray-300 rounded-lg bg-white px-3 py-2 text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Tenant Name *</label>
          <input className={input} value={form.tenantName} onChange={(e) => update('tenantName', e.target.value)} placeholder="e.g. Aisha Khan" />
        </div>
        <div>
          <label className={label}>Landlord / Letting Agent *</label>
          <input className={input} value={form.landlordName} onChange={(e) => update('landlordName', e.target.value)} placeholder="e.g. ABC Lettings" />
        </div>
        <div>
          <label className={label}>Deposit Amount (£) *</label>
          <input className={input} type="number" value={form.depositAmount || ''} onChange={(e) => update('depositAmount', parseFloat(e.target.value) || 0)} placeholder="e.g. 1200" />
        </div>
        <div>
          <label className={label}>Total Deduction Amount (£) *</label>
          <input className={input} type="number" value={form.totalDeductionAmount || ''} onChange={(e) => update('totalDeductionAmount', parseFloat(e.target.value) || 0)} placeholder="e.g. 775" />
        </div>
        <div>
          <label className={label}>Tenancy Start Date *</label>
          <input className={input} type="date" value={form.tenancyStartDate} onChange={(e) => update('tenancyStartDate', e.target.value)} />
        </div>
        <div>
          <label className={label}>Tenancy End Date *</label>
          <input className={input} type="date" value={form.tenancyEndDate} onChange={(e) => update('tenancyEndDate', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={label}>Deposit Protection Scheme (optional)</label>
        <input className={input} value={form.depositScheme} onChange={(e) => update('depositScheme', e.target.value)} placeholder="e.g. TDS, DPS, MyDeposits, or Unknown" />
      </div>

      <div>
        <label className={label}>Main Issue Category *</label>
        <select className={input} value={form.issueCategory} onChange={(e) => update('issueCategory', e.target.value as IssueCategory)}>
          {ISSUE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className={label}>Your Question *</label>
        <textarea
          className={`${input} h-28 resize-none`}
          value={form.userQuestion}
          onChange={(e) => update('userQuestion', e.target.value)}
          placeholder="e.g. Can my landlord charge £300 for cleaning? Can I dispute the repainting charge?"
        />
      </div>
    </div>
  )
}
