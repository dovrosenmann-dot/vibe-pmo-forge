import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSupplierDocuments, documentTypeLabels, DocumentType, SupplierDocument } from "@/hooks/useSupplierDocuments";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentUploadProps {
  projectId: string;
  supplierId?: string;
  contractId?: string;
  title?: string;
}

export function DocumentUpload({ projectId, supplierId, contractId, title }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("other");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { documents, isLoading, uploadDocument, deleteDocument, getDocumentUrl } = useSupplierDocuments(
    projectId,
    supplierId,
    contractId
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await uploadDocument.mutateAsync({
        file: selectedFile,
        projectId,
        supplierId,
        contractId,
        documentType,
        description,
      });
      setSelectedFile(null);
      setDescription("");
      setDocumentType("other");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (document: SupplierDocument) => {
    setDownloadingId(document.id);
    try {
      const url = await getDocumentUrl(document.file_path);
      if (url) {
        window.open(url, "_blank");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (document: SupplierDocument) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      deleteDocument.mutate(document);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title || "Documentos"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Form */}
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do documento"
              rows={2}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Documento
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : documents && documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="font-medium">{doc.file_name}</span>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground">{doc.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {documentTypeLabels[doc.document_type as DocumentType] || doc.document_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    {doc.created_at && format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(doc)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum documento enviado ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
