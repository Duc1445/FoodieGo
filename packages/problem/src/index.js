export class ProblemDetails extends Error {
  constructor({ type, title, status, detail, instance, extensions = {} }) {
    super(detail || title);
    this.type = type || 'about:blank';
    this.title = title || 'Internal Server Error';
    this.status = status || 500;
    this.detail = detail;
    this.instance = instance;
    this.extensions = extensions;
  }

  toJSON() {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      ...this.extensions
    };
  }
}
