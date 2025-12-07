import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { config } from './config';

const httpLink = createHttpLink({
  uri: config.graphqlUrl,
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

