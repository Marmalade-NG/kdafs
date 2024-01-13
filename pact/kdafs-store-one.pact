(module kdafs-store-one GOVERNANCE
  (implements __IF_NAMESPACE__.kdafs-v1-beta)
  (use free.util-time)

  (defcap GOVERNANCE ()
    (enforce-keyset "__IF_NAMESPACE__.governance"))

  (defschema storage-sch
    data:object ; Data itself
    storage-time:time ; The storage date
  )

  (deftable storage-table:{storage-sch})

  ;; ---------------------------------------------------------------------------
  ;; Interface implementation
  ;; ---------------------------------------------------------------------------
  (defun kdafs-immutable:bool ()
    true)

  (defun kdafs-get:object (cid:string)
    (with-read storage-table cid {'data:=data}
      data))

  ;; ---------------------------------------------------------------------------
  ;; Storage function
  ;; ---------------------------------------------------------------------------
  (defun store:string (obj-to-store:object)
    @doc "Store the given object and returns the CID"
    (let ((cid (hash obj-to-store)))
      (insert storage-table cid {'data:obj-to-store,
                                 'storage-time: (now)})
      cid)
  )

  ;; ---------------------------------------------------------------------------
  ;; Metadata (out of the interface)
  ;; ---------------------------------------------------------------------------
  (defun get-storage-time:time (cid:string)
    @doc "Returns the storage time of the object"
    (with-read storage-table cid {'storage-time:=t}
      t))

)
