import React from "react";
import subjectsData from "@/data/subjects.json";
import teachersData from "@/data/teachers.json";
import classesData from "@/data/classes.json";
import { Card } from "@/core/components/Card";

export default function ClassSubjectsView() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Class-wise Subjects & Teachers</h2>
      <div className="space-y-6">
        {classesData.map((cls) => (
          <Card key={cls.class} className="p-4">
            <div className="font-semibold text-lg mb-2">{cls.class}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium mb-1">Subjects Taught:</div>
                <ul className="list-disc ml-5">
                  {subjectsData.filter(sub => (sub.classes || []).includes(cls.class)).map(sub => (
                    <li key={sub.id}>{sub.name} <span className="text-xs text-gray-500">({sub.shortName})</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Available Teachers:</div>
                <ul className="list-disc ml-5">
                  {teachersData.filter(t => (t.classes || []).includes(cls.class)).map(t => (
                    <li key={t.id}>{t.name} <span className="text-xs text-gray-500">({t.subject})</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
