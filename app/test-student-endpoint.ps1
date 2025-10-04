# Test the student certificates endpoint
Write-Host "🧪 Testing student certificates endpoint..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/student/certificates" -Method POST -ContentType "application/json" -Body '{"role":"STUDENT"}'

    Write-Host "✅ Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Response Content:" -ForegroundColor Yellow
    Write-Host $response.Content

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red

    # Check if backend is running
    Write-Host "`n🔍 Checking if backend is running..." -ForegroundColor Yellow
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:3002/health"
        Write-Host "✅ Backend is running - Status: $($health.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend is not responding" -ForegroundColor Red
    }
}
