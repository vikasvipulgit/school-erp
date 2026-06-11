import { useState, useEffect } from 'react';
import { getTeachers } from '@/modules/timetable/services/teachersService';

let _cache = null;
let _promise = null;

function fetchTeachers() {
  if (_cache) return Promise.resolve([..._cache]);
  if (_promise) return _promise;
  _promise = getTeachers()
    .then((data) => { _cache = data; _promise = null; return [..._cache]; })
    .catch((err) => { _promise = null; throw err; });
  return _promise;
}

export function invalidateTeachersCache() {
  _cache = null;
}

export function useTeachers() {
  const [teachers, setTeachers] = useState(_cache ? [..._cache] : []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    fetchTeachers()
      .then((data) => { setTeachers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { teachers, loading };
}
