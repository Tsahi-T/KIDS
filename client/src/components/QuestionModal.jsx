const COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B']

export default function QuestionModal({ question, onAnswer, disabled }) {
  const { a, b, answers } = question
  return (
    <div className="question-overlay">
      <div className="question-box">
        <div className="question-label">כמה זה?</div>
        <div className="question-text">{a} × {b} = ?</div>
        <div className="answers-grid">
          {answers.map((ans, i) => (
            <button
              key={ans}
              className="answer-btn"
              style={{ background: COLORS[i] }}
              onClick={() => !disabled && onAnswer(ans)}
              disabled={disabled}
            >
              {ans}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
