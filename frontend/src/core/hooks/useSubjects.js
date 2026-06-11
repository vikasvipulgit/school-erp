import { useState, useEffect } from 'react';
import { getSubjects } from '@/modules/timetable/services/subjectsService';

let _cache = null;
let _promise = null;

function fetchSubjects() {
  if (_cache) return Promise.resolve([..._cache]);
  if (_promise) return _promise;
  _promise = getSubjects()
    .then((data) => { _cache = data; _promise = null; return [..._cache]; })
    .catch((err) => { _promise = null; throw err; });
  return _promise;
}

export function invalidateSubjectsCache() {
  _cache = null;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState(_cache ? [..._cache] : []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    fetchSubjects()
      .then((data) => { setSubjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { subjects, loading };
}
