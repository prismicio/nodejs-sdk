module.exports = {

  apiEndpoint: 'https://prismicio-nodejs-quickstart.prismic.io/api',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes
  linkResolver(doc, ctx) {
    if (doc.type === 'page') {
      return `/${doc.type}/${doc.uid}`;
    }

    return '/';
  },
};
