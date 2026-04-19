"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, Save, Flame, HeartPulse, ShieldAlert, 
  MapPin, Phone, Info, Plus, Trash2, CheckCircle2 
} from "lucide-react";

type ProtocolType = "fire" | "medical" | "security";

export default function KnowledgeHub() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [knowledge, setKnowledge] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"protocols" | "equipment" | "contacts">("protocols");

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchKnowledge();
  }, [user]);

  async function fetchKnowledge() {
    try {
      const data = await api.get(`/hotels/${user?.hotelId}/knowledge`);
      setKnowledge(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user?.hotelId) return;
    setSaving(true);
    setError("");
    setSaveSuccess(false);
    try {
      await api.patch(`/hotels/${user?.hotelId}/knowledge`, knowledge);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-gray-400">Loading Property Knowledge...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Hub</h1>
            <p className="text-gray-400 text-sm">Manage emergency protocols and property safety data</p>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Changes saved
              </span>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 gap-6">
          {(["protocols", "equipment", "contacts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === "protocols" && (
            <div className="grid md:grid-cols-3 gap-6">
              <ProtocolCard 
                type="fire" 
                value={knowledge.protocols?.fire} 
                onChange={(val) => setKnowledge({...knowledge, protocols: {...knowledge.protocols, fire: val}})} 
              />
              <ProtocolCard 
                type="medical" 
                value={knowledge.protocols?.medical} 
                onChange={(val) => setKnowledge({...knowledge, protocols: {...knowledge.protocols, medical: val}})} 
              />
              <ProtocolCard 
                type="security" 
                value={knowledge.protocols?.security} 
                onChange={(val) => setKnowledge({...knowledge, protocols: {...knowledge.protocols, security: val}})} 
              />
            </div>
          )}

          {activeTab === "equipment" && (
            <div className="space-y-6">
              <EquipmentSection 
                title="Fire Extinguishers" 
                items={knowledge.equipment_mapping?.extinguishers || []} 
                onChange={(list) => setKnowledge({...knowledge, equipment_mapping: {...knowledge.equipment_mapping, extinguishers: list}})}
              />
              <EquipmentSection 
                title="AEDs" 
                items={knowledge.equipment_mapping?.aeds || []} 
                onChange={(list) => setKnowledge({...knowledge, equipment_mapping: {...knowledge.equipment_mapping, aeds: list}})}
              />
              <EquipmentSection 
                title="First Aid Kits" 
                items={knowledge.equipment_mapping?.firstAidKits || []} 
                onChange={(list) => setKnowledge({...knowledge, equipment_mapping: {...knowledge.equipment_mapping, firstAidKits: list}})}
              />
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="grid md:grid-cols-2 gap-6">
              <ContactSection 
                title="Internal Extensions" 
                contacts={knowledge.emergency_contacts?.internal || {}} 
                onChange={(val) => setKnowledge({...knowledge, emergency_contacts: {...knowledge.emergency_contacts, internal: val}})}
              />
              <ContactSection 
                title="External Services" 
                contacts={knowledge.emergency_contacts?.external || {}} 
                onChange={(val) => setKnowledge({...knowledge, emergency_contacts: {...knowledge.emergency_contacts, external: val}})}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProtocolCard({ type, value, onChange }: { type: ProtocolType, value: string, onChange: (v: string) => void }) {
  const styles = {
    fire: { icon: <Flame className="h-5 w-5" />, color: "text-red-400", bg: "bg-red-500/10" },
    medical: { icon: <HeartPulse className="h-5 w-5" />, color: "text-blue-400", bg: "bg-blue-500/10" },
    security: { icon: <ShieldAlert className="h-5 w-5" />, color: "text-amber-400", bg: "bg-amber-500/10" },
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center gap-3 pb-2 space-y-0">
        <div className={`p-2 rounded-lg ${styles[type].bg} ${styles[type].color}`}>
          {styles[type].icon}
        </div>
        <CardTitle className="text-sm font-semibold capitalize text-white">{type} Protocol</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
          placeholder={`Enter ${type} response steps...`}
        />
      </CardContent>
    </Card>
  );
}

function EquipmentSection({ title, items, onChange }: { title: string, items: any[], onChange: (list: any[]) => void }) {
  const addItem = () => onChange([...items, { location: "", notes: "", type: "Standard" }]);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: string, val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-indigo-400" />
          {title}
        </CardTitle>
        <Button onClick={addItem} size="sm" variant="outline" className="h-8 border-gray-700 text-gray-400 hover:text-white">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && <p className="text-gray-500 text-sm text-center py-4 italic">No items listed.</p>}
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-start bg-gray-800/50 p-4 rounded-xl relative group">
            <div className="flex-1 grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase font-semibold">Location</label>
                <input
                  value={item.location}
                  onChange={(e) => updateItem(idx, "location", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="e.g. Near Staircase A, 2nd Floor"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase font-semibold">Notes / Details</label>
                <input
                  value={item.notes || item.type || ""}
                  onChange={(e) => updateItem(idx, item.notes !== undefined ? "notes" : "type", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="e.g. Behind the door"
                />
              </div>
            </div>
            <button 
              onClick={() => removeItem(idx)}
              className="mt-6 text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ContactSection({ title, contacts, onChange }: { title: string, contacts: Record<string, string>, onChange: (v: any) => void }) {
  const updateKey = (oldKey: string, newKey: string) => {
    const next = { ...contacts };
    const val = next[oldKey];
    delete next[oldKey];
    next[newKey] = val;
    onChange(next);
  };
  const updateVal = (key: string, val: string) => {
    onChange({ ...contacts, [key]: val });
  };
  const addContact = () => onChange({ ...contacts, "New Contact": "" });
  const removeContact = (key: string) => {
    const next = { ...contacts };
    delete next[key];
    onChange(next);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Phone className="h-4 w-4 text-indigo-400" />
          {title}
        </CardTitle>
        <Button onClick={addContact} size="sm" variant="outline" className="h-8 border-gray-700 text-gray-400 hover:text-white">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(contacts).map(([key, val]) => (
          <div key={key} className="flex gap-2 items-center">
            <input
              value={key}
              onChange={(e) => updateKey(key, e.target.value)}
              className="w-1/3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-indigo-400 font-semibold"
              placeholder="Label"
            />
            <input
              value={val}
              onChange={(e) => updateVal(key, e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Extension or Number"
            />
            <button onClick={() => removeContact(key)} className="text-gray-600 hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
