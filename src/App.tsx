import { Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { client } from './lib/apollo-client'
import Home from './pages/Home'
import LocationPage from './pages/LocationPage'
import CharacterPage from './pages/CharacterPage'
import CharacterCompatibilityGenerator from './components/CharacterCompatibilityGenerator'

function App() {
  return (
    <ApolloProvider client={client}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/location/:id" element={<LocationPage />} />
        <Route path="/character/:id" element={<CharacterPage />} />
      </Routes>
      <CharacterCompatibilityGenerator />
    </ApolloProvider>
  )
}

export default App

