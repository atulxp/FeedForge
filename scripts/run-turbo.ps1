param(
  [Parameter(Mandatory = $true)]
  [string]$Task
)

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$tools = Join-Path $root '.tools'
$node = 'C:\Program Files\nodejs'

$env:PATH = "$tools;$node;$env:PATH"

& turbo run $Task
exit $LASTEXITCODE
