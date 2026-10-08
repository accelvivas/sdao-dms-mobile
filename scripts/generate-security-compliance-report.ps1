param(
    [string]$OutputPath = "docs/Mobile_Application_Security_and_Data_Privacy_Compliance.docx"
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function ConvertTo-XmlText {
    param([AllowEmptyString()][string]$Text)
    return [System.Security.SecurityElement]::Escape($Text)
}

function New-RunXml {
    param(
        [AllowEmptyString()][string]$Text,
        [int]$Size = 20,
        [bool]$Bold = $false,
        [string]$Color = '000000'
    )

    $boldXml = if ($Bold) { '<w:b/><w:bCs/>' } else { '' }
    $safeText = ConvertTo-XmlText $Text
    return "<w:r><w:rPr><w:rFonts w:ascii=`"Arial`" w:hAnsi=`"Arial`" w:eastAsia=`"Arial`"/>$boldXml<w:color w:val=`"$Color`"/><w:sz w:val=`"$Size`"/><w:szCs w:val=`"$Size`"/></w:rPr><w:t xml:space=`"preserve`">$safeText</w:t></w:r>"
}

function New-ParagraphXml {
    param(
        [AllowEmptyString()][string]$Text,
        [ValidateSet('left', 'center', 'right', 'both')][string]$Alignment = 'left',
        [int]$Size = 20,
        [bool]$Bold = $false,
        [string]$StyleId = '',
        [int]$Before = 0,
        [int]$After = 0,
        [int]$Line = 240,
        [string]$Color = '000000'
    )

    $styleXml = if ($StyleId) { "<w:pStyle w:val=`"$StyleId`"/>" } else { '' }
    $runXml = New-RunXml -Text $Text -Size $Size -Bold $Bold -Color $Color
    return "<w:p><w:pPr>$styleXml<w:jc w:val=`"$Alignment`"/><w:spacing w:before=`"$Before`" w:after=`"$After`" w:line=`"$Line`" w:lineRule=`"auto`"/></w:pPr>$runXml</w:p>"
}

function New-CellXml {
    param(
        [AllowEmptyString()][string]$Text,
        [int]$Width,
        [string]$Shading = 'FFFFFF',
        [bool]$Bold = $false,
        [ValidateSet('left', 'center')][string]$Alignment = 'left',
        [ValidateSet('', 'restart', 'continue')][string]$VerticalMerge = '',
        [int]$FontSize = 16
    )

    $mergeXml = if ($VerticalMerge -eq 'restart') {
        '<w:vMerge w:val="restart"/>'
    } elseif ($VerticalMerge -eq 'continue') {
        '<w:vMerge/>'
    } else {
        ''
    }

    $paragraph = New-ParagraphXml -Text $Text -Alignment $Alignment -Size $FontSize -Bold $Bold -After 0 -Line 190
    return "<w:tc><w:tcPr><w:tcW w:w=`"$Width`" w:type=`"dxa`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"$Shading`"/><w:vAlign w:val=`"center`"/>$mergeXml<w:tcMar><w:top w:w=`"45`" w:type=`"dxa`"/><w:left w:w=`"70`" w:type=`"dxa`"/><w:bottom w:w=`"45`" w:type=`"dxa`"/><w:right w:w=`"70`" w:type=`"dxa`"/></w:tcMar></w:tcPr>$paragraph</w:tc>"
}

function Add-ZipTextEntry {
    param(
        [System.IO.Compression.ZipArchive]$Archive,
        [string]$EntryName,
        [string]$Content
    )

    $entry = $Archive.CreateEntry($EntryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    try {
        $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
        $writer = New-Object System.IO.StreamWriter($stream, $utf8WithoutBom)
        try {
            $writer.Write($Content)
        } finally {
            $writer.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
}

$rows = @(
    [pscustomobject]@{ Category = 'STORAGE'; Practice = 'The app securely stores sensitive data.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'STORAGE'; Practice = 'The app prevents leakage of sensitive data.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'CRYPTO'; Practice = 'The app employs current strong cryptography and uses it according to industry best practices.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'CRYPTO'; Practice = 'The app performs key management according to industry best practices.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'AUTH'; Practice = 'The app uses secure authentication and authorization protocols and follows the relevant best practices.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'AUTH'; Practice = 'The app performs local authentication securely according to the platform best practices.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'AUTH'; Practice = 'The app secures sensitive operations with additional authentication.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'NETWORK'; Practice = 'The app secures all network traffic according to the current best practices.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'NETWORK'; Practice = "The app performs identity pinning for all remote endpoints under the developer's control."; Status = 'NOT COMPLIANT' },
    [pscustomobject]@{ Category = 'PLATFORM'; Practice = 'The app uses IPC mechanisms securely.'; Status = 'NOT APPLICABLE' },
    [pscustomobject]@{ Category = 'PLATFORM'; Practice = 'The app uses WebView securely.'; Status = 'NOT APPLICABLE' },
    [pscustomobject]@{ Category = 'PLATFORM'; Practice = 'The app uses the user interface securely.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'CODE'; Practice = 'The app requires an up-to-date platform version.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'CODE'; Practice = 'The app has a mechanism for enforcing app updates.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'CODE'; Practice = 'The app only uses software components without known vulnerabilities.'; Status = 'NOT COMPLIANT' },
    [pscustomobject]@{ Category = 'CODE'; Practice = 'The app validates and sanitizes all untrusted inputs.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'RESILIENCE'; Practice = 'The app validates the integrity of the platform.'; Status = 'NOT COMPLIANT' },
    [pscustomobject]@{ Category = 'RESILIENCE'; Practice = 'The app implements anti-tampering mechanisms.'; Status = 'PARTIALLY COMPLIANT' },
    [pscustomobject]@{ Category = 'RESILIENCE'; Practice = 'The app implements anti-static analysis mechanisms.'; Status = 'PARTIALLY COMPLIANT' },
    [pscustomobject]@{ Category = 'RESILIENCE'; Practice = 'The app implements anti-dynamic analysis techniques.'; Status = 'NOT COMPLIANT' },
    [pscustomobject]@{ Category = 'PRIVACY'; Practice = 'The app minimizes access to sensitive data and resources.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'PRIVACY'; Practice = 'The app prevents identification of the user.'; Status = 'PARTIALLY COMPLIANT' },
    [pscustomobject]@{ Category = 'PRIVACY'; Practice = 'The app is transparent about data collection and usage.'; Status = 'COMPLIANT' },
    [pscustomobject]@{ Category = 'PRIVACY'; Practice = 'The app offers user control over their data.'; Status = 'PARTIALLY COMPLIANT' }
)

$statusShading = @{
    'COMPLIANT' = 'E2F0D9'
    'PARTIALLY COMPLIANT' = 'FFF2CC'
    'NOT COMPLIANT' = 'F4CCCC'
    'NOT APPLICABLE' = 'E7E6E6'
}

$tableRows = New-Object System.Collections.Generic.List[string]
$header = '<w:tr><w:trPr><w:cantSplit/></w:trPr>'
$header += New-CellXml -Text 'OWASP MASVS' -Width 1450 -Shading 'B7B7B7' -Bold $true -Alignment center -FontSize 17
$header += New-CellXml -Text 'Secure Coding Practices' -Width 6650 -Shading 'B7B7B7' -Bold $true -Alignment center -FontSize 17
$header += New-CellXml -Text 'Compliance Status' -Width 1850 -Shading 'B7B7B7' -Bold $true -Alignment center -FontSize 17
$header += '</w:tr>'
$tableRows.Add($header)

$categoryCounts = @{}
foreach ($row in $rows) {
    if (-not $categoryCounts.ContainsKey($row.Category)) {
        $categoryCounts[$row.Category] = 0
    }
    $categoryCounts[$row.Category]++
}

$categoryIndexes = @{}
foreach ($row in $rows) {
    $index = if ($categoryIndexes.ContainsKey($row.Category)) { $categoryIndexes[$row.Category] } else { 0 }
    $categoryIndexes[$row.Category] = $index + 1
    $merge = if ($categoryCounts[$row.Category] -eq 1) { '' } elseif ($index -eq 0) { 'restart' } else { 'continue' }
    $categoryText = if ($index -eq 0) { $row.Category } else { '' }

    $rowXml = '<w:tr><w:trPr><w:cantSplit/></w:trPr>'
    $rowXml += New-CellXml -Text $categoryText -Width 1450 -Alignment center -VerticalMerge $merge -FontSize 16
    $rowXml += New-CellXml -Text $row.Practice -Width 6650 -Alignment left -FontSize 16
    $rowXml += New-CellXml -Text $row.Status -Width 1850 -Shading $statusShading[$row.Status] -Bold $true -Alignment center -FontSize 15
    $rowXml += '</w:tr>'
    $tableRows.Add($rowXml)
}

$intro = 'The purpose of this assessment was to determine whether the SDAO DMS Mobile Application release 1.0.5 conforms to relevant OWASP Mobile Application Security Verification Standard (MASVS) secure coding and data privacy practices. Testing combined source-code and configuration review, validation of generated Android and iOS settings, dependency vulnerability scanning, TypeScript compilation, Expo Doctor checks, Android production bundling, and verification of the signed EAS APK. The tools used included Expo SDK 57 configuration introspection, Expo Doctor, TypeScript, npm audit, EAS Build, and manual inspection of authentication, storage, network, update, privacy, and input-validation controls.'

$findings = 'The assessment found 14 of 24 practices compliant, four partially compliant, four not compliant, and two not applicable. The application securely stores tokens with platform-protected storage, restricts production traffic to HTTPS, blocks Android cleartext traffic and backups, requires local authentication for sensitive review actions, protects authenticated screens from capture, validates API data and user input, removes temporary attachment copies, minimizes permissions, provides privacy information, and checks for signed over-the-air updates. No critical npm advisory remained after remediation, and the release passed TypeScript compilation, all 21 Expo Doctor checks, Android bundling, and signed EAS APK generation. Remaining gaps include certificate pinning, platform integrity attestation, full anti-tampering and dynamic-analysis defenses, residual known transitive dependency advisories, and complete in-app data-control functions. Overall, the remediation was successful, but the items marked partial or not compliant require backend, native-platform, or upstream dependency work before full OWASP MASVS compliance can be claimed.'

$tableXml = @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="9950" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="60" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tblCellMar>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="000000"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="000000"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid><w:gridCol w:w="1450"/><w:gridCol w:w="6650"/><w:gridCol w:w="1850"/></w:tblGrid>
  $($tableRows -join "`n")
</w:tbl>
"@

$titleXml = New-ParagraphXml -Text 'Mobile Application Security and Data Privacy Compliance' -Alignment center -Size 26 -Bold $true -After 160 -Line 300
$introXml = New-ParagraphXml -Text $intro -Alignment both -Size 19 -StyleId 'CapstoneContentBodyText' -After 160 -Line 245
$captionXml = New-ParagraphXml -Text 'Table 24 Mobile Secure Coding Practices Compliance' -Alignment center -Size 21 -Bold $true -Before 40 -After 100 -Line 260
$findingsXml = New-ParagraphXml -Text $findings -Alignment both -Size 19 -StyleId 'CapstoneContentBodyText' -Before 160 -After 0 -Line 245

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    $titleXml
    $introXml
    $captionXml
    $tableXml
    $findingsXml
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="500" w:right="500" w:bottom="500" w:left="500" w:header="300" w:footer="300" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="312"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:customStyle="1" w:styleId="CapstoneContentBodyText">
    <w:name w:val="Capstone Content – Body Text"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:jc w:val="both"/><w:spacing w:after="120" w:line="245" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr>
  </w:style>
</w:styles>
'@

$contentTypesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

$rootRelationshipsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

$documentRelationshipsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

$timestamp = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Mobile Application Security and Data Privacy Compliance</dc:title>
  <dc:subject>OWASP MASVS secure coding practices compliance assessment</dc:subject>
  <dc:creator>SDAO DMS Mobile Project</dc:creator>
  <cp:lastModifiedBy>SDAO DMS Mobile Project</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$timestamp</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$timestamp</dcterms:modified>
</cp:coreProperties>
"@

$appXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>SDAO DMS</Company>
  <AppVersion>16.0000</AppVersion>
</Properties>
'@

$resolvedOutput = [IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
$workspaceRoot = [IO.Path]::GetFullPath((Get-Location).Path)
if (-not $resolvedOutput.StartsWith($workspaceRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Output path must remain inside the workspace.'
}

$outputDirectory = [IO.Path]::GetDirectoryName($resolvedOutput)
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

$temporaryOutput = "$resolvedOutput.tmp"
if ([IO.File]::Exists($temporaryOutput)) {
    [IO.File]::Delete($temporaryOutput)
}

$fileStream = [IO.File]::Open($temporaryOutput, [IO.FileMode]::CreateNew)
try {
    $archive = New-Object System.IO.Compression.ZipArchive($fileStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
    try {
        Add-ZipTextEntry -Archive $archive -EntryName '[Content_Types].xml' -Content $contentTypesXml
        Add-ZipTextEntry -Archive $archive -EntryName '_rels/.rels' -Content $rootRelationshipsXml
        Add-ZipTextEntry -Archive $archive -EntryName 'word/document.xml' -Content $documentXml
        Add-ZipTextEntry -Archive $archive -EntryName 'word/styles.xml' -Content $stylesXml
        Add-ZipTextEntry -Archive $archive -EntryName 'word/_rels/document.xml.rels' -Content $documentRelationshipsXml
        Add-ZipTextEntry -Archive $archive -EntryName 'docProps/core.xml' -Content $coreXml
        Add-ZipTextEntry -Archive $archive -EntryName 'docProps/app.xml' -Content $appXml
    } finally {
        $archive.Dispose()
    }
} finally {
    $fileStream.Dispose()
}

if ([IO.File]::Exists($resolvedOutput)) {
    [IO.File]::Delete($resolvedOutput)
}
[IO.File]::Move($temporaryOutput, $resolvedOutput)

$counts = $rows | Group-Object Status | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Count)" }
Write-Output "Created: $resolvedOutput"
Write-Output "Rows: $($rows.Count)"
Write-Output ($counts -join '; ')
