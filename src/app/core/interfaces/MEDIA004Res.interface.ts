export interface MEDIA004Res {
    totalCount: number;
    medias:     Media[];
}

export interface Media {
    mediaId:    string;
    base64Data: string;
    bucket:     string;
    fileName:   string;
    sizeBytes:  number;
    mimeType:   string;
    createdAt:  Date;
    updatedAt:  Date;
}
