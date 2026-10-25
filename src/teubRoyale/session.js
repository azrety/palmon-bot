const sessions = new Map();

function createSession(key, data) {
  if (sessions.has(key)) return false;
  sessions.set(key, { ...data, processing: false });
  return true;
}

function getSession(key) {
  return sessions.get(key) || null;
}

function updateSession(key, data) {
  const session = sessions.get(key);
  if (!session) return null;
  Object.assign(session, data);
  return session;
}

function clearSession(key) {
  sessions.delete(key);
}

module.exports = { createSession, getSession, updateSession, clearSession };
