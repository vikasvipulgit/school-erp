
import React, { useState } from "react";
import {
  Building2,
  CalendarDays,
  Save,
  Check,
} from "lucide-react";
import ClassTimeManagement from "./ClassTimeManagement";
import { Button } from "@/core/components/Button";
import { Input } from "@/core/components/Input";
import { Textarea } from "@/core/components/Textarea";
import { Card } from "@/core/components/Card";
import { SectionHeader } from "@/core/components/SectionHeader";

const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function OrganizationSettingsPage() {
  const [orgName, setOrgName] = useState("Lincoln High School");
  const [description, setDescription] = useState("A premier educational institution...");
  const [selectedDays, setSelectedDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const selectAll = () => setSelectedDays([...allDays]);

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
        <Button className="flex items-center gap-2">
          <Save size={18} /> Save Changes
        </Button>
      </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <Input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
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
          <span className="text-sm text-gray-500">
            {selectedDays.length} of 7 days selected
          </span>
          <Button variant="outline" size="sm" onClick={selectAll} type="button">
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
                    (active
                      ? "bg-emerald-500 text-white rounded-sm"
                      : "border border-gray-300 rounded-sm")
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

      {/* Card 3: Class Time Management */}
      <Card className="p-6 mb-4">
        <ClassTimeManagement />
      </Card>
    </div>
  );
}
