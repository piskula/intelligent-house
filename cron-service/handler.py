import urllib.request

def hello(event, context):
  response = urllib.request.urlopen("https://us-central1-intelligent-house-test.cloudfunctions.net/refreshStatus")
  return response.status
