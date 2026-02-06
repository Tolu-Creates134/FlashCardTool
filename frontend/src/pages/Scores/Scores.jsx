import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDeckById, fetchPractiseSessions } from '../../services/api';
import { Trophy } from 'lucide-react';

const Scores = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [loading, setLoading] = useState(false);
  const [practiseSessions, setPractiseSessions] = useState([]);
  const [deck, setDeck] = useState(null);

  useEffect(() => {
    const loadData =  async () => {
      try {
        setLoading(true);
        const [sessionData, deckData] = await Promise.all([
          fetchPractiseSessions(deckId),
          fetchDeckById(deckId)
        ]);

        console.log(deckData)

        setPractiseSessions(sessionData.sessions || []);
        setDeck(deckData?.deck || null)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    loadData();

    console.log(practiseSessions)
  }, [deckId]);

  const rows = useMemo(() => {
    return practiseSessions.map((session) => ({
      id: session.id,
      date: session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '—',
      score: session.accuracy ? `${Math.round(session.accuracy*100)}%` : '—',
      correctTotal:
        session.correctCount !== undefined && session.totalCount !== undefined ? `${session.correctCount}/${session.totalCount}` : '—',
      time: session.completionTime
        ? `${Math.floor(session.completionTime / 60)
            .toString()
            .padStart(2, '0')}:${(session.completionTime % 60)
            .toString()
            .padStart(2, '0')}`
        : '—'
    }));
  }, [practiseSessions]);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        className="mt-4 flex items-center text-indigo-600 font-medium hover:text-indigo-700"
        onClick={() => navigate(`/decks/${deckId}`)}
      >
        <span className="mr-2">{'←'}</span>
        Back to Deck
      </button>

      <div className="p-6 mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy size={28} className="text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Practise Scores</h1>
          </div>
          <p className="text-gray-600">
            Category:{' '}
            <span className="font-medium text-gray-800">
              {deck?.categoryName || '—'}
            </span>{' '}
            · Deck:{' '}
            <span className="font-medium text-gray-800">
              {deck?.name || '—'}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-500">Loading scores…</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-700 border-b">
                <th className="py-3">Date</th>
                <th className="py-3">Score</th>
                <th className="py-3">Correct/Total</th>
                <th className="py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={4}>
                    No scores recorded yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="py-3 text-gray-800">{row.date}</td>
                    <td className="py-3 text-gray-800">{row.score}</td>
                    <td className="py-3 text-gray-800">{row.correctTotal}</td>
                    <td className="py-3 text-gray-800">{row.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Scores
