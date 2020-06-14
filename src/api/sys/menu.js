import request from '@/utils/request'

export const listMenuTree = () => request.get('/sys/menu/list');

export const treeRouter = () => request.get('/sys/menu/router');

export const treeMenu = () => request.get('/sys/menu/tree');

export const getMenu = id => request.get('/sys/menu/' + id);

export const addMenu = data => request.post('/sys/menu', data);

export const updateMenu = data => request.put('/sys/menu', data);

export const delMenu = id => request.delete('/sys/menu/' + id);

