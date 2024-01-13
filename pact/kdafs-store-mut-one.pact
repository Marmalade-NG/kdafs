(module kdafs-store-mut-one GOVERNANCE
  (implements __IF_NAMESPACE__.kdafs-v1-beta)
  (use free.util-time)
  (use free.util-random)

  (defcap GOVERNANCE ()
    (enforce-keyset "__IF_NAMESPACE__.governance"))

  (defschema storage-sch
    data:object ; Data itself
    storage-time:time ; The storage date
    active:bool
  )

  (deftable storage-table:{storage-sch})

  ;; ---------------------------------------------------------------------------
  ;; Interface implementation
  ;; ---------------------------------------------------------------------------
  (defun kdafs-immutable:bool ()
    false)

  (defun kdafs-get:object (cid:string)
    (with-read storage-table cid {'data:=data}
      data))

  ;; ---------------------------------------------------------------------------
  ;; Storage function
  ;; ---------------------------------------------------------------------------
  (defun store:string (obj-to-store:object)
    @doc "Store the given object and returns the CID"
    (let ((cid (random-string 24)))
      (insert storage-table cid {'data:obj-to-store,
                                 'storage-time: (now),
                                 'active:true})
      cid)
  )

  (defun enforce-exist:bool (cid:string)
    (with-default-read storage-table cid {'active:false}
                                         {'active:=active}
      (enforce active "Object does not exist"))
  )

  (defun update-object (cid:string obj-to-store:object)
    @doc "Update a stored object"
    (enforce-exist cid)
    (update storage-table cid {'data:obj-to-store,
                               'storage-time: (now)})
  )

  (defun delete (cid:string)
    @doc "Delete a stored object"
    (enforce-exist cid)
    (update storage-table cid {'active:false})
  )

  ;; ---------------------------------------------------------------------------
  ;; Metadata (out of the interface)
  ;; ---------------------------------------------------------------------------
  (defun get-storage-time:time (cid:string)
    @doc "Returns the storage time of the object"
    (with-read storage-table cid {'storage-time:=t}
      t))

)
