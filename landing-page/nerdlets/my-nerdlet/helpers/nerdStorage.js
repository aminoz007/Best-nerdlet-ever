import { UserStorageQuery, UserStorageMutation } from 'nr1';
import { STORAGE } from './constants';

const downloadSelection = () => {
    return UserStorageQuery.query({
        collection: STORAGE.COLLECTION,
        documentId: STORAGE.DOCUMENT_ID
    }) 
}

const uploadSelection = (selection) => {
    return UserStorageMutation.mutate({
        actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: STORAGE.COLLECTION,
        documentId: STORAGE.DOCUMENT_ID,
        document: selection
    })
}

const deleteSelection = () => {
    return UserStorageMutation.mutate({
        actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection: STORAGE.COLLECTION,
        documentId: STORAGE.DOCUMENT_ID,
    })
}

export { downloadSelection, uploadSelection, deleteSelection }

