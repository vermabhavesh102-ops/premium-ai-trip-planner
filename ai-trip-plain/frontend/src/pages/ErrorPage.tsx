import React from 'react'
import { useParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState'

const defaultMessage = 'Something went wrong. Please try again.'

const friendlyByCode: Record<string, string> = {
  '400': 'Invalid request. Please try again.',
  '401': 'Please log in again.',
  '403': 'Access denied.',
  '404': 'Page not found.',
  '429': 'Too many requests. Please try later.',
  '500': 'Something went wrong. Please try again.',
}

export default function ErrorPage() {
  const { code } = useParams()
  const message = (code && friendlyByCode[code]) || defaultMessage

  return <ErrorState message={message} />
}

