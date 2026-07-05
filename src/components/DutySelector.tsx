import React, { useState } from "react";
import { DutyConfig, DutyType } from "../types";
import { Plus, Edit2, Check, Trash2, Clock, Palette } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TimePickerAMPM from "./TimePickerAMPM";
import { getDutyColorStyles } from "../utils";

interface DutySelectorProps {
  configs: DutyConfig[];
  selectedDutyId: string;
  onSelectDuty: (id: string) => void;
  onUpdateConfig: (updated: DutyConfig) => void;
  onAddConfig: (newConfig: DutyConfig) => void;
  onDeleteConfig: (id: string) => void;
}

const COLOR_PALETTES = [
  { name: "blue", label: "Blue (Morning)", bg: "bg-blue-500", text: "text-blue-900", border: "border-blue-300", badge: "bg-blue-500" },
  { name: "pink", label: "Pink (Evening)", bg: "bg-pink-500", text: "text-pink-900", border: "border-pink-300", badge: "bg-pink-500" },
  { name: "yellow", label: "Yellow (Night)", bg: "bg-amber-400", text: "text-amber-900", border: "border-amber-300", badge: "bg-amber-400" },
  { name: "green", label: "Green", bg: "bg-emerald-500", text: "text-emerald-900", border: "border-emerald-300", badge: "bg-emerald-500" },
  { name: "purple", label: "Purple", bg: "bg-purple-500", text: "text-purple-900", border: "border-purple-300", badge: "bg-purple-500" },
  { name: "orange", label: "Orange", bg: "bg-orange-500", text: "text-orange-900", border: "border-orange-300", badge: "bg-orange-500" },
  { name: "teal", label: "Teal", bg: "bg-teal-500", text: "text-teal-900", border: "border-teal-300", badge: "bg-teal-500" },
  { name: "red", label: "Red", bg: "bg-rose-500", text: "text-rose-900", border: "border-rose-300", badge: "bg-rose-500" },
  { name: "blank", label: "Blank (Holiday)", bg: "bg-transparent", text: "text-slate-500", border: "border-dashed border-slate-300", badge: "bg-slate-400" }
];

const COLOR_CLASSES: Record<string, {
  selectedClass: string;
  bulletClass: string;
  checkColor: string;
}> = {
  blue: {
    selectedClass: "border-blue-500 bg-blue-500/10 shadow-3xs",
    bulletClass: "border-blue-300 bg-blue-100",
    checkColor: "text-blue-600"
  },
  pink: {
    selectedClass: "border-pink-500 bg-pink-500/10 shadow-3xs",
    bulletClass: "border-pink-300 bg-pink-100",
    checkColor: "text-pink-600"
  },
  yellow: {
    selectedClass: "border-amber-400 bg-amber-400/10 shadow-3xs",
    bulletClass: "border-amber-300 bg-amber-100",
    checkColor: "text-amber-600"
  },
  green: {
    selectedClass: "border-emerald-500 bg-emerald-500/10 shadow-3xs",
    bulletClass: "border-emerald-300 bg-emerald-100",
    checkColor: "text-emerald-600"
  },
  purple: {
    selectedClass: "border-purple-500 bg-purple-500/10 shadow-3xs",
    bulletClass: "border-purple-300 bg-purple-100",
    checkColor: "text-purple-600"
  },
  orange: {
    selectedClass: "border-orange-500 bg-orange-500/10 shadow-3xs",
    bulletClass: "border-orange-300 bg-orange-100",
    checkColor: "text-orange-600"
  },
  teal: {
    selectedClass: "border-teal-500 bg-teal-500/10 shadow-3xs",
    bulletClass: "border-teal-300 bg-teal-100",
    checkColor: "text-teal-600"
  },
  red: {
    selectedClass: "border-rose-500 bg-rose-500/10 shadow-3xs",
    bulletClass: "border-rose-300 bg-rose-100",
    checkColor: "text-rose-600"
  },
  blank: {
    selectedClass: "border-slate-400 bg-slate-50 shadow-3xs",
    bulletClass: "border-dashed border-slate-400 bg-white",
    checkColor: "text-slate-600"
  }
};

export default function DutySelector({
  configs,
  selectedDutyId,
  onSelectDuty,
  onUpdateConfig,
  onAddConfig,
  onDeleteConfig
}: DutySelectorProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("blue");
  const [editStartTime, setEditStartTime] = useState("08:00 AM");
  const [editEndTime, setEditEndTime] = useState("04:00 PM");

  const [isCreating, setIsCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("green");
  const [newStartTime, setNewStartTime] = useState("08:00 AM");
  const [newEndTime, setNewEndTime] = useState("04:00 PM");

  const startEdit = (config: DutyConfig) => {
    setIsEditing(config.id);
    setEditLabel(config.label);
    setEditColor(config.colorName);
    setEditStartTime(config.startTime || "08:00 AM");
    setEditEndTime(config.endTime || "04:00 PM");
  };

  const saveEdit = (id: string) => {
    const isBlank = editColor === "blank";
    const styles = getDutyColorStyles(editColor);

    onUpdateConfig({
      id,
      type: isBlank ? "holiday" : configs.find(c => c.id === id)?.type || "custom",
      label: editLabel.trim() || "Unnamed Shift",
      colorName: editColor,
      bgColor: styles.bgColor,
      textColor: styles.textColor,
      borderColor: styles.borderColor,
      badgeColor: styles.badgeColor,
      startTime: editStartTime,
      endTime: editEndTime
    });
    setIsEditing(null);
  };

  const createDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const isBlank = newColor === "blank";
    const id = "duty_" + Math.random().toString(36).substr(2, 9);
    const styles = getDutyColorStyles(newColor);

    onAddConfig({
      id,
      type: isBlank ? "holiday" : "custom",
      label: newLabel.trim(),
      colorName: newColor,
      bgColor: styles.bgColor,
      textColor: styles.textColor,
      borderColor: styles.borderColor,
      badgeColor: styles.badgeColor,
      startTime: newStartTime,
      endTime: newEndTime
    });

    setNewLabel("");
    setIsCreating(false);
  };

  return (
    <div className="bg-transparent border-0 p-0 shadow-none lg:bg-white lg:rounded-2xl lg:border lg:border-slate-100 lg:p-6 lg:shadow-sm">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div>
          <h3 className="text-sm lg:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-500" />
            Duty Palette
          </h3>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
            Select a duty, then click dates on the calendar to assign them.
          </p>
        </div>
        {!isCreating && (
          <button
            id="btn-add-duty"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom
          </button>
        )}
      </div>

      {/* DUTIES LIST */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:flex lg:flex-col gap-1.5 lg:gap-2 pb-2 lg:pb-1 max-w-full lg:max-h-[320px] lg:overflow-y-auto lg:pr-1.5 scrollbar-thin">
        {configs.map((config) => {
          const isSelected = selectedDutyId === config.id;
          const isBlank = config.colorName === "blank";
          const classes = COLOR_CLASSES[config.colorName] || COLOR_CLASSES.blue;

          return (
            <div
              key={config.id}
              id={`duty-item-${config.id}`}
              className={`group flex items-center justify-between p-1.5 xs:p-2 lg:p-3 rounded-xl border transition-all cursor-pointer w-full min-w-0 ${
                isSelected
                  ? classes.selectedClass
                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 bg-white"
              }`}
              onClick={() => {
                onSelectDuty(config.id);
              }}
            >
              <div className="flex items-center gap-1 lg:gap-3 flex-1 min-w-0">
                {/* Active check indicator or color bullet */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div
                    className={`w-3 h-3 lg:w-5 lg:h-5 rounded-full flex items-center justify-center border transition-all ${classes.bulletClass}`}
                  >
                    {isSelected && (
                      <Check className={`w-1.5 h-1.5 lg:w-3 lg:h-3 ${classes.checkColor}`} />
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] xs:text-xs lg:text-xs font-extrabold text-slate-700 truncate leading-tight">{config.label}</p>
                  <p className="hidden xs:flex text-[8px] sm:text-[10px] lg:text-2xs font-bold text-slate-400 uppercase items-center gap-1 mt-0.5 font-mono whitespace-nowrap truncate">
                    <Clock className="w-2 h-2 shrink-0 hidden lg:inline" />
                    {config.startTime && config.endTime ? (
                      <span>{config.startTime} - {config.endTime}</span>
                    ) : (
                      <span>
                        {config.type === "morning" && "08:00 AM - 04:00 PM"}
                        {config.type === "evening" && "04:00 PM - 12:00 AM"}
                        {config.type === "night" && "12:00 AM - 08:00 AM"}
                        {config.type === "holiday" && "Full Day Off"}
                        {config.type === "custom" && "Custom Shift"}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-0.5 lg:gap-1 ml-1 lg:ml-2 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button
                  id={`btn-edit-${config.id}`}
                  onClick={() => startEdit(config)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                  title="Edit duty style"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                {config.type === "custom" && (
                  <button
                    id={`btn-delete-${config.id}`}
                    onClick={() => onDeleteConfig(config.id)}
                    className="p-0.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Delete custom duty"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW CUSTOM DUTY MODAL */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Create Custom Duty</h3>
                <p className="text-4xs font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                  Add a new shift option to the palette
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>

            <form id="form-create-duty" onSubmit={createDuty} className="p-6 space-y-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase mb-1">Duty Name</label>
                <input
                  id="input-duty-name"
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. On-Call, Half Day, Training"
                  className="w-full text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans min-h-[44px]"
                  required
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase mb-1.5">Color Palette</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      id={`btn-palette-color-${palette.name}`}
                      type="button"
                      onClick={() => setNewColor(palette.name)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        newColor === palette.name
                          ? "border-blue-500 ring-2 ring-blue-500/10 bg-white"
                          : "border-slate-200 bg-white/50 hover:bg-white"
                      }`}
                      title={palette.label}
                    >
                      <span className={`w-4 h-4 rounded-full ${palette.name === "blank" ? "border border-dashed border-slate-400 bg-white" : palette.bg}`} />
                    </button>
                  ))}
                </div>
              </div>

              {newColor !== "blank" && (
                <div className="grid grid-cols-2 gap-4">
                  <TimePickerAMPM
                    idPrefix="new-duty-start"
                    label="Default Start Time"
                    value={newStartTime}
                    onChange={setNewStartTime}
                  />
                  <TimePickerAMPM
                    idPrefix="new-duty-end"
                    label="Default End Time"
                    value={newEndTime}
                    onChange={setNewEndTime}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-create-duty"
                  type="submit"
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4.5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  Save Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DUTY MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Edit Duty Style & Hours</h3>
                <p className="text-4xs font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                  Customize palette settings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase mb-1 font-sans">Duty Name</label>
                <input
                  id={`edit-duty-label-modal`}
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase mb-1.5">Color Palette</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      id={`edit-color-btn-modal-${palette.name}`}
                      type="button"
                      onClick={() => setEditColor(palette.name)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        editColor === palette.name
                          ? "border-blue-500 ring-2 ring-blue-500/10 bg-white"
                          : "border-slate-200 bg-white/50 hover:bg-white"
                      }`}
                      title={palette.label}
                    >
                      <span className={`w-4 h-4 rounded-full ${palette.name === "blank" ? "border border-dashed border-slate-400 bg-white" : palette.bg}`} />
                    </button>
                  ))}
                </div>
              </div>

              {editColor !== "blank" && (
                <div className="grid grid-cols-2 gap-4">
                  <TimePickerAMPM
                    idPrefix="edit-start-modal"
                    label="Start Time"
                    value={editStartTime}
                    onChange={setEditStartTime}
                  />
                  <TimePickerAMPM
                    idPrefix="edit-end-modal"
                    label="End Time"
                    value={editEndTime}
                    onChange={setEditEndTime}
                  />
                </div>
              )}

              {/* Modal actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-edit-modal"
                  onClick={() => saveEdit(isEditing)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4.5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
