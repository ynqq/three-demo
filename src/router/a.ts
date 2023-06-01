import { type LocationQuery, type RouteLocationNormalized, type Router } from 'vue-router';

export const IS_ENCODED = 'IS_ENCODED';

export const ROUTER_FORMAT_ERROR = Symbol('ROUTER_FORMAT_ERROR');

export const useEncodeFullPath = (router: Router) => {
  router.beforeEach((to, _from, next) => {
    useRouteEncode(to);
    next();
  });
};

const encode = (str: string | null) => {
  if (str === null) {
    return null;
  }
  return btoa(encodeURI(str));
};

const decode = (str: string | null | undefined, key: string) => {
  if (str === null || str === undefined) {
    return null;
  }
  try {
    return decodeURI(atob(str));
  } catch (error) {
    Promise.reject({ type: ROUTER_FORMAT_ERROR, key: key, val: str, msg: `路由参数: ${key}解析异常: ${str}` });
    return null;
  }
};

// 对query进行解码
function decodeQuery(query: LocationQuery) {
  for (const i in query) {
    let val = query[i];
    if (Array.isArray(val)) {
      val = val.map(v => decode(v, i));
      query[i] = val;
    } else {
      const v = decode(val, i);
      query[i] = v;
    }
  }
  return query;
}

// 对fullpath进行编码
function encodeFullPath(query: LocationQuery, fullPath: string) {
  let [pathName] = fullPath.split('?');
  pathName = `${pathName}?`;
  for (const i in query) {
    if (i === IS_ENCODED) {
      continue;
    }
    let val = query[i];
    if (Array.isArray(val)) {
      val = val.map(v => encode(v));
      pathName = `${pathName}${val.map(v => `${i}=${v}`).join('&')}&`;
    } else {
      const v = encode(val);
      pathName = `${pathName}${i}=${v}&`;
    }
  }
  return pathName;
}

export const useRouteEncode = (to: RouteLocationNormalized) => {
  const { query, fullPath, params } = to;

  const encoded = IS_ENCODED in query;
  if (query && Object.keys(query).length > 0) {
    if (encoded) {
      // 刷新或后退时已编码 需要对query解码
      decodeQuery(query);
    } else {
      // 未编码 需要对fullpath进行编码
      const pathName = encodeFullPath(query, fullPath);
      to.fullPath = `${pathName}${IS_ENCODED}`;
      (to as any).href = to.fullPath;
    }
  }
  if (params && Object.keys(params).length > 0) {
    const { fullPath } = to;
    const matched = to.matched[0];
    if (matched) {
      const { path } = matched;
      const [realPath, ...paramNames] = path.split(':');
      let paramVals = fullPath.split('?')[0].replace(realPath, '').split('/');
      if (encoded) {
        // 已编码
        paramNames.forEach((paramName, index) => {
          if (paramVals[index] !== undefined) {
            const key = paramName.replace('/', '').replace('?', '');
            const val = decode(paramVals[index], key);

            to.params[key] = val === null ? '' : decodeURIComponent(val);
          }
        });
      } else {
        // 未编码
        paramVals = paramVals.map(param => {
          return encode(param)!;
        });
        const after = fullPath.includes('?') ? `?${fullPath.split('?')[1]}` : `?`;
        to.fullPath = `${realPath}${paramVals.join('/')}${after}${fullPath.includes(IS_ENCODED) ? '' : IS_ENCODED}`;
        (to as any).href = to.fullPath;
      }
    }
  }
};
