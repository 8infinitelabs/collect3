package utils

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/mattn/go-sqlite3"
	"github.com/mdobak/go-xerrors"
)

type User struct {
	ID        int64  `db:"id"`
	UID       string `db:"uid"`
	Token     string `db:"auth_token"`
	CreatedAt string `db:"createdAt"`
	UpdatedAt string `db:"updatedAt"`
}

type Content struct {
	CID       string `db:"cid"`
	Storage   string `db:"storage"`
	CreatedAt string `db:"createdAt"`
	UpdatedAt string `db:"updatedAt"`
}
type UserContent struct {
	User_ID     int64  `db:"user_id"`
	Content_CID string `db:"content_cid"`
}

var (
	ErrDuplicate    = errors.New("record already exists")
	ErrNotExists    = errors.New("row not exists")
	ErrUpdateFailed = errors.New("update failed")
	ErrDeleteFailed = errors.New("delete failed")
)

type SQLiteRepository struct {
	db *sqlx.DB
}

var DB *SQLiteRepository

func OpenDB(driver string, datasource string) (*SQLiteRepository, error) {
	rawdb, err := sqlx.Connect(driver, datasource)
	if err != nil {
		return nil, err
	}
	DB = &SQLiteRepository{db: rawdb}
	return DB, nil
}

func (db *SQLiteRepository) Migrate() {
	setPragma := "PRAGMA foreign_keys;"
	createUserTable := `
    CREATE TABLE IF NOT EXISTS user(
      id         INTEGER PRIMARY KEY NOT NULL, 
      uid        TEXT UNIQUE NOT NULL,
      auth_token TEXT UNIQUE NOT NULL,
      createdAt  DATETIME DEFAULT CURRENT_DATE,
      updatedAt  DATETIME DEFAULT CURRENT_DATE
    );
  `
	createContentTable := `
    CREATE TABLE IF NOT EXISTS content(
      cid       TEXT  PRIMARY KEY NOT NULL,
			storage   TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_DATE,
      updatedAt DATETIME DEFAULT CURRENT_DATE
    );
  `
	createUserContentTable := `
    CREATE TABLE IF NOT EXISTS user_content(
      user_id     INTEGER NOT NULL,
      content_cid TEXT NOT NULL,
      UNIQUE(user_id, content_cid),
      FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY(content_cid) REFERENCES content(cid) ON DELETE CASCADE
    );
  `

	tx := db.db.MustBegin()

	tx.MustExec(setPragma)
	Logger.Info("setting pragma")

	tx.MustExec(createUserTable)
	Logger.Info("setting user table")

	tx.MustExec(createContentTable)
	Logger.Info("setting content table")

	tx.MustExec(createUserContentTable)
	Logger.Info("setting user_content table")

	//tx.MustExec(insertAdminAccount)
	//Logger.Info("inserting admin account");

	err := tx.Commit()
	if err != nil {
		Logger.Error(err.Error())
		panic(err)
	}
}

func (db *SQLiteRepository) CreateUser(
	id int64,
	uid string,
	token string,
) error {
	res, err := db.db.Exec("INSERT INTO user(id,uid,auth_token) values(?,?,?)", id, uid, token)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return ErrDuplicate
			}
		}
		return err
	}

	_, err = res.LastInsertId()
	if err != nil {
		return err
	}

	return nil
}

func (db *SQLiteRepository) UpdateToken(id int64, token string) error {
	_, err := db.db.Exec("UPDATE user SET auth_token=? WHERE id=?", token, id)
	if err != nil {
		return err
	}

	return nil
}

func (db *SQLiteRepository) GetUserByID(id int64) (User, error) {
	var user User
	err := db.db.Get(&user, "SELECT id,uid FROM user WHERE id=?", id)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, nil
	}
	if err != nil {
		return User{}, err
	}
	return user, nil
}

func (db *SQLiteRepository) GetUserByUID(uid string) (User, error) {
	var user User
	err := db.db.Get(&user, "SELECT id,uid FROM user WHERE uid=?", uid)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, nil
	}
	if err != nil {
		return User{}, err
	}
	return user, nil
}

func (db *SQLiteRepository) AllUsers() ([]User, error) {
	var all []User
	err := db.db.Get(&all, "SELECT * FROM user")
	if errors.Is(err, sql.ErrNoRows) {
		return []User{}, nil
	}
	if err != nil {
		return nil, err
	}

	return all, nil
}

func (db *SQLiteRepository) GetContentByCID(cid string) (Content, error) {
	var content Content
	err := db.db.Get(&content, "SELECT cid FROM content WHERE cid=?", cid)
	if errors.Is(err, sql.ErrNoRows) {
		return Content{}, nil
	}
	if err != nil {
		return Content{}, err
	}
	return content, nil
}

func (db *SQLiteRepository) CreateContent(cid string, storage string) error {
	res, err := db.db.Exec("INSERT INTO content(cid, storage) values(?,?)", cid, storage)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return ErrDuplicate
			}
		}
		return err
	}

	_, err = res.LastInsertId()
	if err != nil {
		return err
	}

	return nil
}

func (db *SQLiteRepository) CreateUserContent(id int64, cid string) error {
	res, err := db.db.Exec("INSERT INTO user_content(user_id, content_cid) values(?,?)", id, cid)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) {
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return ErrDuplicate
			}
		}
		return err
	}

	_, err = res.LastInsertId()
	if err != nil {
		return err
	}

	return nil
}

func (db *SQLiteRepository) UploadContent(uid string, cid string, storage string) error {
	var err error
	user, err := db.GetUserByUID(uid)
	if err != nil {
		return err
	}
	if user == (User{}) {
		return xerrors.New("User Does Not Exist")
	}
	content, err := db.GetContentByCID(cid)
	if err != nil {
		return err
	}
	if content == (Content{}) {
		err = db.CreateContent(cid, storage)
		if err != nil {
			if !errors.Is(err, ErrDuplicate) {
				return err
			}
		}
	}
	err = db.CreateUserContent(user.ID, cid)
	return err
}

func (db *SQLiteRepository) UnlinkContent(uid string, cid string) error {
	var err error

	user, err := db.GetUserByUID(uid)
	if err != nil {
		return err
	}

	if user == (User{}) {
		return ErrNotExists
	}

	res, err := db.db.Exec("DELETE FROM user_content WHERE user_id=? AND content_cid=?", user.ID, cid)

	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrDeleteFailed
	}
	return nil
}
