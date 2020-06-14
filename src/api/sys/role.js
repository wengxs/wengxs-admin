import request from '@/utils/request'

export const allRole = () => request.get('/sys/role/all');

export const listRole = data => request.get('/sys/role/list', {params: data});

export const getRole = id => request.get('/sys/role/' + id);

export const addRole = data => request.post('/sys/role', data);

export const updateRole = data => request.put('/sys/role', data);

export const delRole = id => request.delete('/sys/role/' + id);
