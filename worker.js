export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/marcos' || url.pathname === '/marcos.html') {
      return Response.redirect(new URL('/frameworks', request.url), 301);
    }
    if (url.pathname === '/confianza' || url.pathname === '/confianza.html') {
      return Response.redirect(new URL('/trustcenter', request.url), 301);
    }
    return env.ASSETS.fetch(request);
  }
};
