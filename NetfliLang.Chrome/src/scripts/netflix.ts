function interceptHttpCalls(): void {
  console.log('intercepting');
  const _this = this;
  // @ts-ignore
  const xhrOpen = window.XMLHttpRequest.prototype.open;
  // @ts-ignore
  window.XMLHttpRequest.prototype.open = function (
    method: string,
    url: string,
    async: boolean,
    username?: string | null,
    password?: string | null
  ): void {
    this.addEventListener('load', () => {
      console.log('works');
      try {
        if (window.location.href.indexOf('netflix.com/watch') === -1) return;
        const parser = new DOMParser();
        const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
        console.log(ttmlDoc);
      } catch {}
    });

    return xhrOpen.apply(this, arguments);
  };
}

interceptHttpCalls();
