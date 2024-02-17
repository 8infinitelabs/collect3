package utils

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/mattn/go-sqlite3"
)

type User struct {
  ID        int64  `db:"id"`
  UID       string `db:"uid"`
  CreatedAt string `db:"createdAt"`
  UpdatedAt string `db:"updatedAt"`
}

type Content struct {
	CID       string `db:"cid"`
  CreatedAt string `db:"createdAt"`
  UpdatedAt string `db:"updatedAt"`
}
type UserContent struct {
	User_ID  int64  `db:"user_id"`
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

var DB *SQLiteRepository;

func OpenDB(driver string, datasource string) (*SQLiteRepository, error) {
  rawdb, err := sqlx.Connect(driver, datasource)
  if err != nil {
    return nil, err
  }
  DB = &SQLiteRepository{db: rawdb};
  return DB, nil
}

func (db *SQLiteRepository) Migrate() {
  setPragma := "PRAGMA foreign_keys;"
  createUserTable := `
    CREATE TABLE IF NOT EXISTS user(
      id    INTEGER PRIMARY KEY NOT NULL, 
      uid   TEXT UNIQUE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_DATE,
      updatedAt DATETIME DEFAULT CURRENT_DATE
    );
  `
  createContentTable := `
    CREATE TABLE IF NOT EXISTS content(
      cid TEXT PRIMARY KEY NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_DATE,
      updatedAt DATETIME DEFAULT CURRENT_DATE
    );
  `
  createUserContentTable := `
    CREATE TABLE IF NOT EXISTS user_content(
      user_id INTEGER NOT NULL,
      content_cid TEXT NOT NULL,
      UNIQUE(user_id, content_cid),
      FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY(content_cid) REFERENCES content(cid) ON DELETE CASCADE
    );
  `
	//insertAdminAccount := "INSERT INTO user(id,uid) values(1,'admin');"


  tx := db.db.MustBegin()

	tx.MustExec(setPragma)
  Logger.Info("setting pragma");
  
	tx.MustExec(createUserTable)
  Logger.Info("setting user table");

  tx.MustExec(createContentTable)
  Logger.Info("setting content table");

  tx.MustExec(createUserContentTable)
  Logger.Info("setting user_content table");

  //tx.MustExec(insertAdminAccount)
  //Logger.Info("inserting admin account");

  err := tx.Commit();
  if err != nil {
    Logger.Error(err.Error());
    panic(err)
  }
}

func (db *SQLiteRepository) CreateUser(user User) (error) {
	res, err := db.db.Exec("INSERT INTO user(id,uid) values(?,?)", user.ID, user.UID)
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

//func (r *SQLiteRepository) GetByName(name string) (*Website, error) {
//	row := r.db.QueryRow("SELECT * FROM websites WHERE name = ?", name)
//	var website Website
//	if err := row.Scan(&website.ID, &website.Name, &website.URL, &website.Rank); err != nil {
//		if errors.Is(err, sql.ErrNoRows) {
//			return nil, ErrNotExists
//		}
//		return nil, err
//	}
//	return &website, nil
//}
//
//func (r *SQLiteRepository) Delete(id int64) error {
//	res, err := r.db.Exec("DELETE FROM websites WHERE id = ?", id)
//	if err != nil {
//		return err
//	}
//	rowsAffected, err := res.RowsAffected()
//	if err != nil {
//		return err
//	}
//	if rowsAffected == 0 {
//		return ErrDeleteFailed
//	}
//	return err
//}
