export const MONTHS = [
  { num: 1,  he: 'ינואר',   en: 'January'   },
  { num: 2,  he: 'פברואר',  en: 'February'  },
  { num: 3,  he: 'מרץ',     en: 'March'     },
  { num: 4,  he: 'אפריל',   en: 'April'     },
  { num: 5,  he: 'מאי',     en: 'May'       },
  { num: 6,  he: 'יוני',    en: 'June'      },
  { num: 7,  he: 'יולי',    en: 'July'      },
  { num: 8,  he: 'אוגוסט',  en: 'August'    },
  { num: 9,  he: 'ספטמבר',  en: 'September' },
  { num: 10, he: 'אוקטובר', en: 'October'   },
  { num: 11, he: 'נובמבר',  en: 'November'  },
  { num: 12, he: 'דצמבר',   en: 'December'  },
]

// types: 'num_he' (number→Hebrew) | 'num_en' (number→English)
export function generateMonthQuestion() {
  const idx     = Math.floor(Math.random() * MONTHS.length)
  const month   = MONTHS[idx]
  const type    = Math.random() < 0.5 ? 'num_he' : 'num_en'

  const others = MONTHS.filter((_, i) => i !== idx).sort(() => Math.random() - 0.5).slice(0, 3)

  if (type === 'num_he') {
    const answers = [{ label: month.he, value: month.he }, ...others.map(m => ({ label: m.he, value: m.he }))]
      .sort(() => Math.random() - 0.5)
    return { type, prompt: month.num, promptSub: 'מה שם החודש?', correct: month.he, answers, enName: month.en }
  } else {
    const answers = [{ label: month.en, value: month.en }, ...others.map(m => ({ label: m.en, value: m.en }))]
      .sort(() => Math.random() - 0.5)
    return { type, prompt: month.num, promptSub: 'What month is this?', correct: month.en, answers, enName: month.en }
  }
}
