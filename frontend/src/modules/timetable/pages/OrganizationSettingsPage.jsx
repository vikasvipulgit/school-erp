import React, { useState, useEffect } from "react";
import {
  Building2, CalendarDays, Save, Check, ShieldCheck, Loader2,
} from "lucide-react";
import ClassTimeManagement from "./ClassTimeManagement";
import { Button } from "@/core/components/Button";
import { Input } from "@/core/components/Input";
import { Textarea } from "@/core/components/Textarea";
import { Card } from "@/core/components/Card";
import { SectionHeader } from "@/core/components/SectionHeader";
import { useAuth } from "@/core/context/AuthContext";
import { getTimetableRules, saveTimetableRules, DEFAULT_RULES } from "@/modules/timetable/rules";
import {
  loadTimetableSettings,
  saveTimetableSettings,
} from "@/modules/timetable/services/timetableFirebaseService";

const SLOTS_KEY = "erp_period_slots";

const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function OrganizationSettingsPage() {
  const { role } = useAuth();
  const canManageRules = ["admin", "principal"].includes(role);

  const [orgName, setOrgName] = useState("Lincoln High School");
  const [description, setDescription] = useState("A premier educational institution...");
  const [selectedDays, setSelectedDays] = useState([
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  ]);
  const [rules, setRules] = useState(() => getTimetableRules());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from DB on mount — populate localStorage + state
  useEffect(() => {
    loadTimetableSettings().then((s) => {
      if (s) {
        if (Array.isArray(s.periodSlots) && s.periodSlots.length) {
          localStorage.setItem(SLOTS_KEY, JSON.stringify(s.periodSlots));
        }
        if (Array.isArray(s.workingDays) && s.workingDays.length) {
          setSelectedDays(s.workingDays);
        }
        if (s.rules && Object.keys(s.rules).length) {
          const merged = { ...DEFAULT_RULES, ...s.rules };
          setRules(merged);
          saveTimetableRules(merged);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const rawSlots = JSON.parse(localStorage.getItem(SLOTS_KEY) || "[]");
      saveTimetableRules(rules); // keep localStorage in sync too
      await saveTimetableSettings(rawSlots, selectedDays, rules);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save settings", e);
    }
    setSaving(false);
  };

  const toggleDay = (day) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const handleRuleChange = (key, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    setRules((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={22} className="text-gray-700" />
            <span className="text-2xl font-bold">Organization Settings</span>
          </div>
          <div className="text-sm text-gray-500">
            Manage your school organization details and configurations
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? "Saving…" : saved ? "Saved to DB" : "Save Settings"}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Loader2 size={14} className="animate-spin" /> Loading settings from database…
        </div>
      )}

      {/* Card 1: Organization Information */}
      <Card className="p-6 mb-4">
        <SectionHeader
          className="mb-4"
          title={
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-gray-700" />
              <span className="font-semibold text-base">Organization Information</span>
            </div>
          }
          description="Basic details about your school organization."
          titleClassName="text-base font-semibold"
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
          <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            className="min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Card>

      {/* Card 2: School Working Days */}
      <Card className="p-6 mb-4">
        <SectionHeader
          className="mb-2"
          title={
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-gray-700" />
              <span className="font-semibold text-base">School Working Days</span>
            </div>
          }
          description="Configure which days your school operates."
          titleClassName="text-base font-semibold"
        />
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{selectedDays.length} of 7 days selected</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedDays([...allDays])} type="button">
            Select All
          </Button>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          {allDays.map((day) => {
            const active = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={
                  "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer " +
                  (active
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-white border-gray-200 text-gray-500")
                }
              >
                <span
                  className={
                    "flex items-center justify-center w-4 h-4 " +
                    (active ? "bg-emerald-500 text-white rounded-sm" : "border border-gray-300 rounded-sm")
                  }
                >
                  {active ? <Check size={14} /> : null}
                </span>
                {day}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Card 3: Timetable Rules (admin/principal only) */}
      {canManageRules && (
        <Card className="p-6 mb-4">
          <SectionHeader
            className="mb-4"
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-gray-700" />
                <span className="font-semibold text-base">Timetable Rules</span>
              </div>
            }
            description="Constraints applied when building and validating timetables."
            titleClassName="text-base font-semibold"
          />
          <div className="grid grid-cols-2 gap-6">
            <RuleField
              label="Min periods per subject / week"
              description="Minimum times a subject must appear per class per week."
              value={rules.minPeriodsPerSubject}
              min={0} max={10}
              onChange={(v) => handleRuleChange("minPeriodsPerSubject", v)}
            />
            <RuleField
              label="Max periods per subject / week"
              description="Maximum times a subject can appear per class per week."
              value={rules.maxPeriodsPerSubject}
              min={1} max={20}
              onChange={(v) => handleRuleChange("maxPeriodsPerSubject", v)}
            />
            <RuleField
              label="Max same subject per day"
              description="A subject cannot repeat more than this many times in one day."
              value={rules.maxPeriodsPerSubjectPerDay}
              min={1} max={5}
              onChange={(v) => handleRuleChange("maxPeriodsPerSubjectPerDay", v)}
            />
            <RuleField
              label="Max teacher periods per day"
              description="A teacher cannot be assigned more than this many periods in one day."
              value={rules.maxTeacherPeriodsPerDay}
              min={1} max={12}
              onChange={(v) => handleRuleChange("maxTeacherPeriodsPerDay", v)}
            />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Defaults: min {DEFAULT_RULES.minPeriodsPerSubject}, max/week {DEFAULT_RULES.maxPeriodsPerSubject},
            max/day {DEFAULT_RULES.maxPeriodsPerSubjectPerDay}, teacher max/day {DEFAULT_RULES.maxTeacherPeriodsPerDay}.
            Click "Save Settings" above to persist to the database.
          </p>
        </Card>
      )}

      {/* Card 4: Period Schedule & Classes */}
      <Card className="p-6 mb-4">
        <ClassTimeManagement />
      </Card>
    </div>
  );
}

function RuleField({ label, description, value, min, max, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-0.5">{label}</label>
      <p className="text-xs text-gray-400 mb-2">{description}</p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <span className="text-xs text-gray-400">{min}–{max}</span>
      </div>
    </div>
  );
}
