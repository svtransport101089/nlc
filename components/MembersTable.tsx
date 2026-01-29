
import React from 'react';
import { Member } from '../types';

interface MembersTableProps {
  members: Member[];
  onUpdate: (members: Member[]) => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ members, onUpdate }) => {
  const handleMemberChange = (id: string, field: keyof Member, value: string | number) => {
    const updated = members.map(m => m.id === id ? { ...m, [field]: value } : m);
    onUpdate(updated);
  };

  const addMember = () => {
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      sn: members.length + 1,
      name: '',
      regNo: '',
      phone: ''
    };
    onUpdate([...members, newMember]);
  };

  const removeMember = (id: string) => {
    onUpdate(members.filter(m => m.id !== id).map((m, idx) => ({ ...m, sn: idx + 1 })));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-slate-300">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center print:bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Members List</h2>
        <button 
          onClick={addMember}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors print:hidden"
        >
          + Add Member
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-3 w-16">S.N</th>
              <th className="px-6 py-3">Member Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3 w-10 print:hidden"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-400 font-mono text-sm">{member.sn}</td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none py-1 print:text-slate-800"
                    placeholder="Name..."
                  />
                </td>
                <td className="px-6 py-4">
                  <select
                    value={member.regNo}
                    onChange={(e) => handleMemberChange(member.id, 'regNo', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none py-1 cursor-pointer text-slate-700 font-medium print:text-slate-800"
                  >
                    <option value="" disabled>Select status</option>
                    <option value="Registered">Registered</option>
                    <option value="Irregular">Irregular</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={member.phone}
                    onChange={(e) => handleMemberChange(member.id, 'phone', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none py-1 font-mono text-sm print:text-slate-800"
                    placeholder="Phone..."
                  />
                </td>
                <td className="px-6 py-4 print:hidden text-right">
                  <button 
                    onClick={() => removeMember(member.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersTable;
