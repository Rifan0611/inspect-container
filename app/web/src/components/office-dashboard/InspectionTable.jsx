import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';

const InspectionTable = ({ data }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-700 bg-gray-50 uppercase border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-medium">No.</th>
                        <th className="px-6 py-4 font-medium">Tanggal</th>
                        <th className="px-6 py-4 font-medium">Nomor Kontainer</th>
                        <th className="px-6 py-4 font-medium">Nama Kapal</th>
                        <th className="px-6 py-4 font-medium">Kondisi</th>
                        <th className="px-6 py-4 font-medium">Sisi</th>
                        <th className="px-6 py-4 font-medium text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(row.tanggal).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{row.nomor_kontainer}</td>
                                <td className="px-6 py-4">{row.nama_kapal}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        row.kondisi === 'GOOD' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {row.kondisi}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{row.sisi || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-nph-blue hover:text-nph-navy transition-colors">
                                        <EyeIcon className="w-5 h-5 mx-auto" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                                Tidak ada data
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InspectionTable;
