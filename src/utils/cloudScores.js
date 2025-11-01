export async function cloudAvailable() {
  return (
    typeof window !== 'undefined' &&
    window.firebase &&
    window.firebase.apps &&
    window.firebase.apps.length > 0
  )
}

export async function saveCloudScore(score, player) {
  if (!(await cloudAvailable())) return false
  try {
    const db = window.firebase.firestore()
    await db.collection('highScores').add({
      score: Number(score) || 0,
      player: player || 'Player',
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
    })
    return true
  } catch (e) {
    console.warn('Cloud save failed', e)
    return false
  }
}

export async function fetchTopScores(limit = 10) {
  if (!(await cloudAvailable())) return []
  try {
    const db = window.firebase.firestore()
    const snap = await db.collection('highScores').orderBy('score', 'desc').limit(limit).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.warn('Fetch cloud scores failed', e)
    return []
  }
}
