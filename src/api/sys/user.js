import request from '@/utils/request'

export const listUser = data => request.get('/sys/user/list', {params: data});

export const getUser = id => request.get('/sys/user/' + id);

export const addUser = data => request.post('/sys/user', data);

export const updateUser = data => request.put('/sys/user', data);

export const delUser = id => request.delete('/sys/user/' + id);
