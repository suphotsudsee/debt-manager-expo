import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

// ─── Types ──────────────────────────────────────────────
type Debt = {
  id: number;
  name: string;
  amount: number;
  monthly: number;
  interest: number;
};

// ─── Main App ────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<'manage' | 'plan'>('manage');
  const [debts, setDebts] = useState<Debt[]>([]);

  // Form state
  const [editId, setEditId] = useState<string>('');
  const [inName, setInName] = useState('');
  const [inAmount, setInAmount] = useState('');
  const [inMonthly, setInMonthly] = useState('');
  const [inInterest, setInInterest] = useState('');
  const [showCalc, setShowCalc] = useState(false);

  // Calc state
  const [calcMethod, setCalcMethod] = useState<'fixed' | 'effective'>('fixed');
  const [cPrincipal, setCPrincipal] = useState('');
  const [cMonthly, setCMonthly] = useState('');
  const [cMonths, setCMonths] = useState('');

  // Plan state
  const [payPower, setPayPower] = useState('');
  const [goalMonths, setGoalMonths] = useState('120');

  const totalDebt = debts.reduce((s, d) => s + d.amount, 0);
  const sortedDebts = [...debts].sort((a, b) => b.interest - a.interest);

  // ─── Calc ──────────────────────────────────────────────
  const runCalc = () => {
    const p = parseFloat(cPrincipal) || 0;
    const m = parseFloat(cMonthly) || 0;
    const mon = parseFloat(cMonths) || 0;
    let rate = 0;

    if (calcMethod === 'fixed') {
      if (p > 0 && mon > 0) {
        rate = (((m * mon) - p) / p) / (mon / 12) * 100;
      }
    } else {
      let low = 0, high = 100, mid = 0;
      for (let i = 0; i < 40; i++) {
        mid = (low + high) / 2;
        const r = mid / 1200;
        const estPmt = p * (r * Math.pow(1 + r, mon)) / (Math.pow(1 + r, mon) - 1);
        if (estPmt > m) high = mid; else low = mid;
      }
      rate = mid;
    }

    setInAmount(String(p));
    setInMonthly(String(m));
    setInInterest(rate.toFixed(2));
    setShowCalc(false);
  };

  // ─── Save / Edit / Delete ─────────────────────────────
  const saveDebt = () => {
    const name = inName.trim();
    const amount = parseFloat(inAmount) || 0;
    const monthly = parseFloat(inMonthly) || 0;
    const interest = parseFloat(inInterest) || 0;

    if (!name || amount <= 0) return;

    if (editId) {
      setDebts(prev =>
        prev.map(d =>
          d.id === parseInt(editId)
            ? { ...d, name, amount, monthly, interest }
            : d
        )
      );
    } else {
      setDebts(prev => [
        ...prev,
        { id: Date.now(), name, amount, monthly, interest },
      ]);
    }
    clearForm();
  };

  const editDebt = (d: Debt) => {
    setEditId(String(d.id));
    setInName(d.name);
    setInAmount(String(d.amount));
    setInMonthly(String(d.monthly));
    setInInterest(String(d.interest));
  };

  const clearForm = () => {
    setEditId('');
    setInName('');
    setInAmount('');
    setInMonthly('');
    setInInterest('');
  };

  const deleteDebt = (id: number) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  // ─── Plan ────────────────────────────────────────────
  const pay = parseFloat(payPower) || 0;
  const goal = parseFloat(goalMonths) || 0;
  const monthsToClear = pay > 0 && totalDebt > 0 ? Math.ceil(totalDebt / pay) : 0;
  const targetMonthly = goal > 0 && totalDebt > 0 ? Math.ceil(totalDebt / goal) : 0;

  const fmt = (n: number) => n.toLocaleString('en-US');

  // ─── Render ───────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>แอปช่วยปลดหนี้</Text>
        <Text style={styles.headerSub}>
          ยอดหนี้รวม: <Text style={styles.headerAmount}>{fmt(totalDebt)}</Text> ฿
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.tabActive]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabText, activeTab === 'manage' && styles.tabTextActive]}>
            รายการหนี้
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plan' && styles.tabActive]}
          onPress={() => setActiveTab('plan')}
        >
          <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>
            แผนการจ่าย
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'manage' ? (
          <ManageTab
            editId={editId}
            inName={inName}
            inAmount={inAmount}
            inMonthly={inMonthly}
            inInterest={inInterest}
            showCalc={showCalc}
            calcMethod={calcMethod}
            cPrincipal={cPrincipal}
            cMonthly={cMonthly}
            cMonths={cMonths}
            setInName={setInName}
            setInAmount={setInAmount}
            setInMonthly={setInMonthly}
            setInInterest={setInInterest}
            setShowCalc={setShowCalc}
            setCalcMethod={setCalcMethod}
            setCPrincipal={setCPrincipal}
            setCMonthly={setCMonthly}
            setCMonths={setCMonths}
            runCalc={runCalc}
            saveDebt={saveDebt}
            clearForm={clearForm}
            sortedDebts={sortedDebts}
            editDebt={editDebt}
            deleteDebt={deleteDebt}
            fmt={fmt}
          />
        ) : (
          <PlanTab
            payPower={payPower}
            setPayPower={setPayPower}
            goalMonths={goalMonths}
            setGoalMonths={setGoalMonths}
            monthsToClear={monthsToClear}
            targetMonthly={targetMonthly}
            fmt={fmt}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Manage Tab ──────────────────────────────────────────
type ManageProps = {
  editId: string;
  inName: string;
  inAmount: string;
  inMonthly: string;
  inInterest: string;
  showCalc: boolean;
  calcMethod: 'fixed' | 'effective';
  cPrincipal: string;
  cMonthly: string;
  cMonths: string;
  setInName: (v: string) => void;
  setInAmount: (v: string) => void;
  setInMonthly: (v: string) => void;
  setInInterest: (v: string) => void;
  setShowCalc: (v: boolean) => void;
  setCalcMethod: (v: 'fixed' | 'effective') => void;
  setCPrincipal: (v: string) => void;
  setCMonthly: (v: string) => void;
  setCMonths: (v: string) => void;
  runCalc: () => void;
  saveDebt: () => void;
  clearForm: () => void;
  sortedDebts: Debt[];
  editDebt: (d: Debt) => void;
  deleteDebt: (id: number) => void;
  fmt: (n: number) => string;
};

function ManageTab(p: ManageProps) {
  return (
    <View style={styles.tabContent}>
      {/* Form */}
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="ชื่อรายการหนี้"
          value={p.inName}
          onChangeText={p.setInName}
        />
        <TextInput
          style={styles.input}
          placeholder="ยอดเงินต้น (฿)"
          value={p.inAmount}
          onChangeText={p.setInAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="ค่างวดรายเดือน (฿)"
          value={p.inMonthly}
          onChangeText={p.setInMonthly}
          keyboardType="numeric"
        />
        <View style={styles.interestRow}>
          <TextInput
            style={[styles.input, styles.interestInput]}
            placeholder="ดอกเบี้ย (%)"
            value={p.inInterest}
            onChangeText={p.setInInterest}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.calcToggleBtn}
            onPress={() => p.setShowCalc(!p.showCalc)}
          >
            <Text style={styles.calcToggleText}>คำนวณ</Text>
          </TouchableOpacity>
        </View>

        {/* Calc Box */}
        {p.showCalc && (
          <View style={styles.calcBox}>
            <View style={styles.pickerWrap}>
              {(['fixed', 'effective'] as const).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.pickerItem,
                    p.calcMethod === m && styles.pickerItemActive,
                  ]}
                  onPress={() => p.setCalcMethod(m)}
                >
                  <Text style={[
                    styles.pickerText,
                    p.calcMethod === m && styles.pickerTextActive,
                  ]}>
                    {m === 'fixed' ? 'ดอกเบี้ยคงที่' : 'ลดต้นลดดอก'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.calcInput}
              placeholder="เงินต้น"
              value={p.cPrincipal}
              onChangeText={p.setCPrincipal}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.calcInput}
              placeholder="ค่างวด"
              value={p.cMonthly}
              onChangeText={p.setCMonthly}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.calcInput}
              placeholder="จำนวนงวด"
              value={p.cMonths}
              onChangeText={p.setCMonths}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.calcRunBtn} onPress={p.runCalc}>
              <Text style={styles.calcRunText}>คำนวณ</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={p.saveDebt}>
          <Text style={styles.saveBtnText}>
            {p.editId ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debt List */}
      {p.sortedDebts.map(d => (
        <View key={d.id} style={styles.debtCard}>
          <View style={styles.debtInfo}>
            <Text style={styles.debtName}>{d.name}</Text>
            <Text style={styles.debtSub}>เงินต้น: {p.fmt(d.amount)} ฿</Text>
            <Text style={styles.debtMonthly}>จ่ายรายเดือน: {p.fmt(d.monthly)} ฿</Text>
          </View>
          <View style={styles.debtRight}>
            <Text style={styles.debtInterest}>{d.interest}%</Text>
            <View style={styles.debtActions}>
              <TouchableOpacity onPress={() => p.editDebt(d)}>
                <Text style={styles.editBtn}>แก้ไข</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => p.deleteDebt(d.id)}>
                <Text style={styles.delBtn}>ลบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Plan Tab ────────────────────────────────────────────
type PlanProps = {
  payPower: string;
  setPayPower: (v: string) => void;
  goalMonths: string;
  setGoalMonths: (v: string) => void;
  monthsToClear: number;
  targetMonthly: number;
  fmt: (n: number) => string;
};

function PlanTab(p: PlanProps) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.planCard}>
        {/* Pay power */}
        <View style={styles.planSection}>
          <Text style={styles.planLabel}>จ่ายไหวต่อเดือน (฿)</Text>
          <TextInput
            style={styles.planInput}
            value={p.payPower}
            onChangeText={p.setPayPower}
            keyboardType="numeric"
            placeholder="0"
          />
          {p.monthsToClear > 0 ? (
            <Text style={styles.planResult}>
              หนี้ทั้งหมดจะหมดในประมาณ{' '}
              <Text style={styles.planBold}>{p.monthsToClear} เดือน</Text>
            </Text>
          ) : null}
        </View>

        {/* Goal months */}
        <View style={styles.planDivider} />
        <View style={styles.planSection}>
          <Text style={styles.planLabelGray}>ต้องการปลดหนี้ใน (งวด):</Text>
          <TextInput
            style={styles.planInput}
            value={p.goalMonths}
            onChangeText={p.setGoalMonths}
            keyboardType="numeric"
          />
          <View style={styles.goalResultBox}>
            <Text style={styles.goalResultLabel}>ต้องจ่ายรายเดือนอย่างน้อย:</Text>
            <Text style={styles.goalResultValue}>
              {p.targetMonthly > 0 ? `${p.fmt(p.targetMonthly)} ฿` : '0 ฿'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 6,
  },
  headerAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#2563eb',
  },

  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    gap: 12,
  },

  // Form
  formCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  interestRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  interestInput: {
    flex: 1,
    marginBottom: 0,
  },
  calcToggleBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  calcToggleText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },

  // Calc box
  calcBox: {
    marginTop: 4,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 12,
    gap: 8,
  },
  pickerWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  pickerItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pickerText: {
    fontSize: 13,
    color: '#475569',
  },
  pickerTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  calcInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  calcRunBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  calcRunText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Save button
  saveBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Debt card
  debtCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  debtInfo: {
    flex: 1,
  },
  debtName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e293b',
  },
  debtSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  debtMonthly: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 2,
  },
  debtRight: {
    alignItems: 'flex-end',
  },
  debtInterest: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  debtActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  editBtn: {
    fontSize: 12,
    color: '#60a5fa',
    textDecorationLine: 'underline',
  },
  delBtn: {
    fontSize: 12,
    color: '#f87171',
    textDecorationLine: 'underline',
  },

  // Plan tab
  planCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 16,
  },
  planSection: {
    gap: 8,
  },
  planLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  planLabelGray: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  planInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  planResult: {
    fontSize: 14,
    color: '#334155',
    marginTop: 4,
  },
  planBold: {
    fontWeight: 'bold',
  },
  planDivider: {
    height: 1,
    backgroundColor: '#bfdbfe',
  },
  goalResultBox: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  goalResultLabel: {
    fontSize: 12,
    color: '#bfdbfe',
  },
  goalResultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
});