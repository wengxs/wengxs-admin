import request from '@/utils/request'

export const listUser = data => {request.get('/sys/user/list', {params: data})};


