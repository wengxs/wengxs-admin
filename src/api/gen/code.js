import request from '@/utils/request'

export const listTable = data => request.get('/gen/code/list', {params: data});

export const getTable = id => request.get('/gen/code/' + id);

export const addTable = data => request.post('/gen/code', data);

export const updateTable = data => request.put('/gen/code', data);

export const delTable = id => request.delete('/gen/code/' + id);

export const previewCode = id => request.get('/gen/code/preview/' + id)
