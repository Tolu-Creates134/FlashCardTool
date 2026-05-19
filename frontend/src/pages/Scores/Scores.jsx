import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeckQuery } from '../../hooks/queries/useDeckQuery';
import { usePractiseSessionsQuery } from '../../hooks/queries/usePractiseSessionsQuery';
import { Trophy } from 'lucide-react';

/**
 * Scores component
 * @returns 
 */
const Scores = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const {
    data: practiseSessions = [],
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsQueryError
  } = usePractiseSessionsQuery(deckId)

  const {
    data: deck = null,
    isLoading: deckLoading,
    isError: deckError,
    error: deckQueryError
  } = useDeckQuery(deckId)

  const loading = deckLoading || sessionsLoading

  const error = 
  deckQueryError?.message || 
  sessionsQueryError?.message ||
  (deckError || sessionsError
    ? 'Unable to load scores. Please try again.'
    : ''
  );

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

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={() => navigate(`/decks/${deckId}`)}
        >
          Back to Deck
        </button>
      </div>
    );
  }

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
