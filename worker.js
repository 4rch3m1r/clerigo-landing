export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/marcos' || url.pathname === '/marcos.html') {
      return Response.redirect(new URL('/frameworks', request.url), 301);
    }
    if (url.pathname === '/confianza' || url.pathname === '/confianza.html') {
      return Response.redirect(new URL('/trustcenter', request.url), 301);
    }
    if (url.pathname === '/contacto' || url.pathname === '/contacto.html') {
      return Response.redirect(new URL('/contact', request.url), 301);
    }
    if (url.pathname === '/precios' || url.pathname === '/precios.html') {
      return Response.redirect(new URL('/pricing', request.url), 301);
    }
    if (url.pathname === '/login' || url.pathname === '/login.html' || url.pathname === '/es/login' || url.pathname === '/es/login.html') {
      return Response.redirect('https://app.clerigo.io/login', 301);
    }
    return env.ASSETS.fetch(request);
  }
};
